import { callable, type DownloadItem } from '@steambrew/client';
import { getSettings, setWatchedApps } from './settings';
import { runPowerAction } from './powerRunner';

const logDebug = callable<[{ msg: string }], string>('log_debug');

function debug(msg: string): void {
	logDebug({ msg }).catch(() => {
		/* logging must never break the watcher */
	});
}

/** The current download queue, refreshed live on every items callback — feeds the game picker only. */
let latestItems: DownloadItem[] = [];

/** Last seen download queue — feeds the game picker in the arm menu. */
export function getDownloadSnapshot(): DownloadItem[] {
	return latestItems;
}

/** Appids currently in the queue (incomplete), for the "wait for these games" picker and the uninstall guard. */
export function getQueueCandidates(): number[] {
	const ids: number[] = [];
	for (const item of latestItems) {
		if (item.appid > 0 && !item.completed) ids.push(item.appid);
	}
	return ids;
}

/**
 * Watches the download queue and, while armed, fires the power action when the
 * watched work finishes.
 *
 * Decisions rest on the two fields Steam demonstrably maintains on download
 * items (its own downloads-page code reads them): `appid` and `completed`.
 * Deliberately NOT trusted: the callback's `isDownloading` flag and the
 * `active`/`paused` fields — their runtime semantics are unverified, and a
 * misread there previously meant the drain condition never became true.
 *
 *  - Whole-queue mode → fires once the list holds no incomplete items AND at
 *    least one item was actually seen reaching `completed` this run. Removing
 *    the last queued game empties the list without anything completing, so it
 *    can't fake a finish; pausing keeps items incomplete, so it blocks firing.
 *  - Specific games → fires once every watched game has reported
 *    `completed: true` at least once. Completion is remembered even if Steam
 *    later drops the entry from its recently-completed list. Watched games the
 *    user removes are pruned by uninstallGuard, not guessed at here.
 */
export function initDownloadWatcher(): () => void {
	/** True once any incomplete item has been seen this run. */
	let sawActiveWork = false;
	let sawInstall = false;
	/** Appids Steam has reported `completed: true` for at least once this run. */
	let completedThisRun = new Set<number>();
	let callbackLogs = 0;

	const resetRun = (): void => {
		sawActiveWork = false;
		sawInstall = false;
		completedThisRun = new Set();
	};

	const registration = SteamClient.Downloads.RegisterForDownloadItems((isDownloading: boolean, payload: DownloadItem[]) => {
		// The @steambrew typing lies: at runtime the second argument is an array of
		// per-client wrappers `{remote_client_id, item_data: DownloadItem[]}`.
		const wrappers = Array.isArray(payload) ? (payload as unknown[]) : [];
		latestItems = wrappers.flatMap((entry) => {
			const wrapper = entry as { item_data?: DownloadItem[] } & DownloadItem;
			if (Array.isArray(wrapper?.item_data)) return wrapper.item_data;
			return typeof wrapper?.appid === 'number' ? [wrapper] : [];
		});

		for (const item of latestItems) {
			if (item.appid > 0 && item.completed) completedThisRun.add(item.appid);
		}

		const settings = getSettings();

		if (callbackLogs < 8) {
			callbackLogs += 1;
			const dump = latestItems.map((i) => `${i.appid}:${i.active ? 'A' : ''}${i.paused ? 'P' : ''}${i.completed ? 'C' : ''}`).join(',');
			debug(`items #${callbackLogs}: isDownloading=${isDownloading}, count=${latestItems.length}, [${dump}], armed=${settings.armed}, watched=[${settings.watchedApps.join(',')}]`);
		}

		// ---- Specific-game mode ----
		if (settings.watchedApps.length > 0) {
			const stillPending = settings.watchedApps.some((appid) => !completedThisRun.has(appid));
			const anyDone = settings.watchedApps.some((appid) => completedThisRun.has(appid));

			if (settings.armed && !stillPending && anyDone) {
				debug(`all watched games finished ([${settings.watchedApps.join(',')}]) — firing action`);
				setWatchedApps([]);
				resetRun();
				void runPowerAction('auto');
			}
			return;
		}

		// ---- Whole-queue mode ----
		const anyIncomplete = latestItems.some((item) => !item.completed);

		if (anyIncomplete) {
			if (!sawActiveWork) debug(`saw incomplete downloads: [${latestItems.filter((i) => !i.completed).map((i) => i.appid).join(',')}]`);
			sawActiveWork = true;
			if (latestItems.some((item) => !item.completed && item.buildid === 0)) sawInstall = true;
			return;
		}

		// Nothing incomplete remains. Fire only if this run actually produced a
		// confirmed completion — a queue emptied purely by removals doesn't count.
		if (sawActiveWork) {
			const confirmed = completedThisRun.size;
			const relevant = settings.onlyWhenInstalling ? sawInstall : true;
			const fire = settings.armed && relevant && confirmed > 0;
			debug(`queue drained (confirmedCompleted=${confirmed}, relevant=${relevant}, armed=${settings.armed}) — ${fire ? 'firing' : 'skipping'}`);
			resetRun();
			if (fire) {
				void runPowerAction('auto');
			}
		}
	});

	debug('download watcher registered');

	return () => registration.unregister();
}
