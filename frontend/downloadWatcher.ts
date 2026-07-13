import { callable, type DownloadItem } from '@steambrew/client';
import { getSettings, setArmed, setWatchedApps } from './settings';
import { runPowerAction } from './powerRunner';

const logDebug = callable<[{ msg: string }], string>('log_debug');
const luaGetAppStates = callable<[{ appids_json: string }], string>('get_app_states');
const luaGetLibrarySnapshot = callable<[], string>('get_library_snapshot');

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

/** Appids currently in the queue (incomplete), for the "wait for these games" picker. */
export function getQueueCandidates(): number[] {
	const ids: number[] = [];
	for (const item of latestItems) {
		if (item.appid > 0 && !item.completed) ids.push(item.appid);
	}
	return ids;
}

function bitSet(flags: number, pos: number): boolean {
	return Math.floor(flags / 2 ** pos) % 2 === 1;
}

/**
 * StateFlags bit layout reverse-engineered by SteamShutdown
 * (https://github.com/akorb/SteamShutdown) from `appmanifest_<appid>.acf`:
 *  - bit 1  a download is running
 *  - bit 6  the download is no longer running (overrides bit 1/10)
 *  - bit 9  the download was stopped by the user
 *  - bit 10 a DLC download is running
 */
function isDownloadingFlags(flags: number): boolean {
	if (flags < 0) return false;
	return (bitSet(flags, 1) || bitSet(flags, 10)) && !bitSet(flags, 9) && !bitSet(flags, 6);
}

/** Bit 9 means the user cancelled/removed it — tell apart from a real finish. */
function isCancelledFlags(flags: number): boolean {
	return flags >= 0 && bitSet(flags, 9);
}

async function fetchAppFlags(appids: number[]): Promise<Map<number, number>> {
	const map = new Map<number, number>();
	if (appids.length === 0) return map;
	try {
		const raw = await luaGetAppStates({ appids_json: JSON.stringify(appids) });
		for (const pair of raw.split(',')) {
			if (!pair) continue;
			const [idStr, flagsStr] = pair.split(':');
			const id = Number(idStr);
			if (Number.isFinite(id)) map.set(id, Number(flagsStr));
		}
	} catch (error) {
		console.error('[power-actions] Failed to read app states:', error);
	}
	return map;
}

/** appid -> StateFlags for every app that currently has a manifest on disk. An
 * appid absent from the map has no manifest at all right now. */
async function fetchLibrarySnapshot(): Promise<Map<number, number>> {
	const map = new Map<number, number>();
	try {
		const raw = await luaGetLibrarySnapshot();
		for (const pair of raw.split(',')) {
			if (!pair) continue;
			const [idStr, flagsStr] = pair.split(':');
			const id = Number(idStr);
			if (Number.isFinite(id)) map.set(id, Number(flagsStr));
		}
	} catch (error) {
		console.error('[power-actions] Failed to scan library:', error);
	}
	return map;
}

const POLL_INTERVAL_MS = 1500;
const MIN_TRIGGERED_POLL_GAP_MS = 300;

let activePoll: (() => Promise<void>) | null = null;
let lastPollStartedAt = 0;

/**
 * Lets a UI-side observer (e.g. a click on the downloads queue) nudge the
 * watcher to re-check disk/queue state right away instead of waiting out the
 * rest of the poll interval. Purely a latency optimization — the poll itself
 * is exactly the same check that already runs on a timer, so this can't
 * introduce a new way to fire incorrectly, only fire sooner.
 */
export function notifyQueueInteraction(): void {
	if (!activePoll) return;
	if (Date.now() - lastPollStartedAt < MIN_TRIGGERED_POLL_GAP_MS) return;
	void activePoll();
}

/**
 * Watches the download queue and, while armed, fires the power action when the
 * watched work finishes.
 *
 * Completion is decided by reading `appmanifest_<appid>.acf` straight off disk
 * (same technique as SteamShutdown: https://github.com/akorb/SteamShutdown),
 * not by trusting `SteamClient.Downloads.RegisterForDownloadItems` — that
 * callback has been observed to skip or delay events for short/small
 * downloads, which made the plugin miss completion entirely in some cases.
 *
 * A finished download and a removed one both stop showing the "downloading"
 * bits in StateFlags, so that alone isn't enough to fire on. They're told
 * apart by whether the manifest file still exists afterwards:
 *  - Finished: the app is now installed, so its manifest stays on disk, just
 *    without the downloading bits set.
 *  - Removed/uninstalled ("Remove from device", cancelling a queued item,
 *    etc.): Steam deletes the manifest file entirely.
 * Only the first case counts as a finish.
 *
 * The JS callback is kept only for the queue-picker UI, for telling whether a
 * run is a fresh install (for "only after new installs"), and to nudge a
 * cancellation check a little earlier when a game visibly leaves the live
 * queue — none of that is load-bearing for correctness, only latency.
 *
 *  - No games selected → fires once every app that was seen downloading this
 *    run has either finished (manifest still present) or been removed
 *    (manifest gone), as long as at least one of them actually finished.
 *  - Specific games selected → same rule, scoped to the picked games. One
 *    that gets removed is dropped from the watch list instead of counted as
 *    done (disarms if it was the last one).
 */
export function initDownloadWatcher(): () => void {
	let sawInstall = false;
	/** Appids in the live queue as incomplete as of the last items callback tick. */
	let prevIncompleteIds = new Set<number>();
	/** Appids that vanished from the live queue while still incomplete — used only to poll sooner, see notifyQueueInteraction. */
	const pendingCancellations = new Set<number>();

	const itemsRegistration = SteamClient.Downloads.RegisterForDownloadItems((_isDownloading: boolean, payload: DownloadItem[]) => {
		// The @steambrew typing lies: at runtime the second argument is an array of
		// per-client wrappers `{remote_client_id, item_data: DownloadItem[]}`.
		const wrappers = Array.isArray(payload) ? (payload as unknown[]) : [];
		latestItems = wrappers.flatMap((entry) => {
			const wrapper = entry as { item_data?: DownloadItem[] } & DownloadItem;
			if (Array.isArray(wrapper?.item_data)) return wrapper.item_data;
			return typeof wrapper?.appid === 'number' ? [wrapper] : [];
		});
		// Fresh installs report buildid 0 until the first build lands. ACF's
		// StateFlags don't carry this distinction, so it's tracked here purely
		// for the "only after new installs" setting.
		if (latestItems.some((item) => !item.completed && item.buildid === 0)) sawInstall = true;

		const currentIds = new Set(latestItems.filter((item) => item.appid > 0).map((item) => item.appid));
		for (const appid of prevIncompleteIds) {
			if (!currentIds.has(appid)) pendingCancellations.add(appid);
		}
		prevIncompleteIds = new Set(latestItems.filter((item) => item.appid > 0 && !item.completed).map((item) => item.appid));
		if (pendingCancellations.size > 0) notifyQueueInteraction();
	});

	/** Appids seen downloading (per ACF) at least once during the current armed run. */
	let wasDownloading = new Set<number>();
	/** Appids confirmed to have actually finished (manifest still present, no longer downloading). */
	let confirmedDone = new Set<number>();
	/** Whole-queue mode only: true once anything has been seen downloading this armed run. */
	let sawActiveWork = false;
	let wasArmed = false;
	let polling = false;

	const resetRun = (): void => {
		wasDownloading = new Set();
		confirmedDone = new Set();
		sawActiveWork = false;
		sawInstall = false;
		pendingCancellations.clear();
	};

	const poll = async (): Promise<void> => {
		if (polling) return; // don't overlap a slow disk scan with the next tick
		polling = true;
		lastPollStartedAt = Date.now();
		try {
			const settings = getSettings();

			if (!settings.armed) {
				if (wasArmed) resetRun();
				wasArmed = false;
				return;
			}
			wasArmed = true;
			pendingCancellations.clear();

			if (settings.watchedApps.length > 0) {
				const flags = await fetchAppFlags(settings.watchedApps);
				const removed: number[] = [];

				for (const appid of settings.watchedApps) {
					const f = flags.get(appid) ?? -1;
					if (isCancelledFlags(f) || (f < 0 && wasDownloading.has(appid))) {
						removed.push(appid);
						continue;
					}
					if (isDownloadingFlags(f)) {
						wasDownloading.add(appid);
					} else if (f >= 0 && wasDownloading.has(appid)) {
						confirmedDone.add(appid);
					}
				}

				if (removed.length > 0) {
					for (const appid of removed) {
						wasDownloading.delete(appid);
						confirmedDone.delete(appid);
					}
					const remaining = settings.watchedApps.filter((appid) => !removed.includes(appid));
					debug(`watched games removed/uninstalled: [${removed.join(',')}], remaining=[${remaining.join(',')}]`);
					if (remaining.length === 0) {
						setWatchedApps([]);
						setArmed(false);
					} else {
						setWatchedApps(remaining);
					}
					return;
				}

				const anyPending = settings.watchedApps.some((appid) => !confirmedDone.has(appid) && (!wasDownloading.has(appid) || isDownloadingFlags(flags.get(appid) ?? -1)));

				if (!anyPending && confirmedDone.size > 0) {
					debug(`all watched games finished ([${settings.watchedApps.join(',')}]) — firing action`);
					setWatchedApps([]);
					void runPowerAction('auto');
				}
				return;
			}

			const snapshot = await fetchLibrarySnapshot();
			let anyDownloading = false;

			for (const [appid, flags] of snapshot) {
				if (isDownloadingFlags(flags)) {
					wasDownloading.add(appid);
					anyDownloading = true;
					sawActiveWork = true;
				}
			}
			for (const appid of wasDownloading) {
				const flags = snapshot.get(appid);
				if (flags !== undefined && isDownloadingFlags(flags)) continue; // still going
				if (flags !== undefined) {
					confirmedDone.add(appid); // manifest still exists, no longer downloading — genuinely finished
				}
				// else: manifest is gone entirely — removed/uninstalled, not a finish. Just stop tracking it below.
			}
			wasDownloading = new Set([...wasDownloading].filter((appid) => {
				const flags = snapshot.get(appid);
				return flags !== undefined && isDownloadingFlags(flags);
			}));

			if (anyDownloading) return;

			if (confirmedDone.size > 0) {
				const relevant = settings.onlyWhenInstalling ? sawInstall : true;
				debug(`queue drained, ${confirmedDone.size} confirmed finished (relevant=${relevant}) — ${relevant ? 'firing' : 'skipping'}`);
				const shouldFire = relevant;
				resetRun();
				if (shouldFire) {
					void runPowerAction('auto');
				}
			} else if (sawActiveWork) {
				// Everything that was active got removed/uninstalled — nothing genuinely
				// finished. Reset quietly and keep waiting for real activity.
				debug('queue drained but nothing confirmed finished (likely all removed) — not firing');
				resetRun();
			}
		} finally {
			polling = false;
		}
	};

	const intervalId = setInterval(() => {
		void poll();
	}, POLL_INTERVAL_MS);

	activePoll = poll;
	debug('download watcher registered');

	return () => {
		if (activePoll === poll) activePoll = null;
		itemsRegistration.unregister();
		clearInterval(intervalId);
	};
}
