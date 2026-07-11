import { callable, type DownloadItem, type DownloadOverview } from '@steambrew/client';
import { getSettings, setWatchedApps } from './settings';
import { runPowerAction } from './powerRunner';

const logDebug = callable<[{ msg: string }], string>('log_debug');

function debug(msg: string): void {
	logDebug({ msg }).catch(() => {
		/* logging must never break the watcher */
	});
}

let latestItems: DownloadItem[] = [];
/** Appids seen downloading this session (from items or the overview feed). */
const seenApps = new Set<number>();
let itemCallbackLogs = 0;

/** Last seen download queue — feeds the game picker in the arm menu. */
export function getDownloadSnapshot(): DownloadItem[] {
	return latestItems;
}

/**
 * Every appid known to be (or have been) downloading this session. Merges the
 * item snapshot with the overview feed, because RegisterForDownloadItems has
 * been observed not to deliver anything in some sessions while the overview
 * stream updates continuously during any download.
 */
export function getQueueCandidates(): number[] {
	const ids = new Set<number>(seenApps);
	for (const item of latestItems) {
		if (!item.completed && item.appid > 0) ids.add(item.appid);
	}
	return [...ids];
}

/**
 * Watches the download queue and, while armed, fires the power action when
 * the watched work finishes:
 *
 *  - no games selected → when a run of active downloads drains to an idle
 *    queue (SteamShutdown behaviour). Fires only if downloads were actually
 *    seen active this run, never on launch with an idle queue.
 *  - specific games selected → when every selected game's download completes,
 *    even if other downloads are still running. Requires at least one of them
 *    to be seen completed, so removing games from the queue can't trigger it.
 */
export function initDownloadWatcher(): () => void {
	let sawActiveWork = false;
	let sawInstall = false;
	let prevWatchedPending = 0;

	const itemsRegistration = SteamClient.Downloads.RegisterForDownloadItems((isDownloading: boolean, payload: DownloadItem[]) => {
		// The @steambrew typing lies: at runtime the second argument is an array
		// of per-client wrappers `{remote_client_id, item_data: DownloadItem[]}`
		// (verified against Steam's own OnDownloadItems in the UI chunk). Unwrap
		// them, but tolerate the documented flat shape too.
		const wrappers = Array.isArray(payload) ? (payload as unknown[]) : [];
		latestItems = wrappers.flatMap((entry) => {
			const wrapper = entry as { item_data?: DownloadItem[] } & DownloadItem;
			if (Array.isArray(wrapper?.item_data)) return wrapper.item_data;
			return typeof wrapper?.appid === 'number' ? [wrapper] : [];
		});
		if (itemCallbackLogs < 3) {
			itemCallbackLogs += 1;
			debug(`items callback #${itemCallbackLogs}: isDownloading=${isDownloading}, count=${latestItems.length}, appids=[${latestItems.map((i) => i.appid).join(',')}]`);
		}
		for (const item of latestItems) {
			if (item.appid > 0 && !item.completed) seenApps.add(item.appid);
		}

		const settings = getSettings();

		if (settings.watchedApps.length > 0) {
			const pending = settings.watchedApps.filter((appid) => {
				const item = latestItems.find((candidate) => candidate.appid === appid);
				return item ? !item.completed : false;
			});
			const completedSeen = settings.watchedApps.some((appid) => latestItems.find((candidate) => candidate.appid === appid)?.completed);
			const hadPending = prevWatchedPending > 0;
			prevWatchedPending = pending.length;

			if (settings.armed && hadPending && pending.length === 0 && completedSeen) {
				debug('watched downloads finished, firing action');
				setWatchedApps([]);
				void runPowerAction('auto');
			}
			return;
		}
		prevWatchedPending = 0;

		const active = latestItems.filter((item) => item.active && !item.paused && !item.completed);
		const pendingInstall = active.some((item) => item.buildid === 0);

		if (isDownloading && active.length > 0) {
			sawActiveWork = true;
			if (pendingInstall) sawInstall = true;
			return;
		}

		if (!isDownloading && active.length === 0 && sawActiveWork) {
			const relevant = settings.onlyWhenInstalling ? sawInstall : true;
			sawActiveWork = false;
			sawInstall = false;
			if (settings.armed && relevant) {
				debug('download queue drained, firing action');
				void runPowerAction('auto');
			}
		}
	});

	const overviewRegistration = SteamClient.Downloads.RegisterForDownloadOverview((overview: DownloadOverview) => {
		const appid = overview?.update_appid ?? 0;
		if (appid > 0 && !seenApps.has(appid)) {
			seenApps.add(appid);
			debug(`overview: now downloading appid ${appid}`);
		}
	});

	debug('download watcher registered');

	return () => {
		itemsRegistration.unregister();
		overviewRegistration.unregister();
	};
}
