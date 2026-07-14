import { callable } from '@steambrew/client';
import { getQueueCandidates } from './downloadWatcher';
import { getSettings, setArmed, setWatchedApps } from './settings';

const logDebug = callable<[{ msg: string }], string>('log_debug');

function debug(msg: string): void {
	logDebug({ msg }).catch((): void => {
		/* logging must never break anything */
	});
}

function toAppIds(value: unknown): number[] {
	if (typeof value === 'number' && Number.isFinite(value)) return [value];
	if (Array.isArray(value)) {
		return value.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry));
	}
	return [];
}

/**
 * When the user removes/uninstalls a game, protect the armed state *before*
 * Steam acts on it — a removal makes the game vanish from the queue, which in
 * a race could be misread as "downloads finished" and fire the power action.
 *
 * Scoped, not blanket (a blanket disarm previously killed legitimate arms:
 * the user removed unrelated games while waiting for another download, the
 * plugin disarmed, and the real finish never fired):
 *  - watched-games mode: removing a watched game prunes just that game
 *    (disarms only when nothing is left to wait for); removing anything else
 *    is ignored.
 *  - whole-queue mode: disarm only when the removed game is currently in the
 *    incomplete download queue (that removal could otherwise drain the queue
 *    and look like a finish); uninstalling an idle library game is ignored.
 *  - if the appids can't be extracted from the call, fall back to a full
 *    disarm — safety over convenience.
 *
 * Hooked at the SteamClient API level (locale/layout-independent):
 *  - `Installs.OpenUninstallWizard(appIds, ...)` — "Uninstall" / "Удалить с устройства".
 *  - `Downloads.RemoveFromDownloadList(appId)` — cancelling a queued download.
 * The original call is always forwarded unchanged.
 */
export function initUninstallGuard(): () => void {
	const restores: Array<() => void> = [];

	const handleRemoval = (appids: number[], reason: string): void => {
		const settings = getSettings();
		if (!settings.armed) return;

		if (appids.length === 0) {
			debug(`disarming — ${reason} (couldn't identify the game, disarming to be safe)`);
			setArmed(false);
			return;
		}

		if (settings.watchedApps.length > 0) {
			const affected = settings.watchedApps.filter((id) => appids.includes(id));
			if (affected.length === 0) {
				debug(`${reason} of [${appids.join(',')}] ignored — not among watched [${settings.watchedApps.join(',')}]`);
				return;
			}
			const remaining = settings.watchedApps.filter((id) => !appids.includes(id));
			if (remaining.length === 0) {
				debug(`disarming — ${reason} of last watched game(s) [${affected.join(',')}]`);
				setWatchedApps([]);
				setArmed(false);
			} else {
				debug(`${reason} of watched [${affected.join(',')}] — pruned, still waiting for [${remaining.join(',')}]`);
				setWatchedApps(remaining);
			}
			return;
		}

		const queued = getQueueCandidates();
		const touchesQueue = appids.some((id) => queued.includes(id));
		if (touchesQueue) {
			debug(`disarming — ${reason} of queued download [${appids.join(',')}]`);
			setArmed(false);
		} else {
			debug(`${reason} of [${appids.join(',')}] ignored — not in the download queue [${queued.join(',')}]`);
		}
	};

	const wrap = (obj: Record<string, unknown> | undefined, method: string, reason: string): void => {
		if (!obj || typeof obj[method] !== 'function') return;
		const original = obj[method] as (...args: unknown[]) => unknown;
		const patched = (...args: unknown[]): unknown => {
			try {
				handleRemoval(toAppIds(args[0]), reason);
			} catch {
				/* never block the real action */
			}
			return original.apply(obj, args);
		};
		obj[method] = patched;
		restores.push(() => {
			// Only restore if nothing else wrapped over us in the meantime.
			if (obj[method] === patched) obj[method] = original;
		});
	};

	try {
		const client = SteamClient as unknown as { Installs?: Record<string, unknown>; Downloads?: Record<string, unknown> };
		wrap(client.Installs, 'OpenUninstallWizard', 'remove from device');
		wrap(client.Downloads, 'RemoveFromDownloadList', 'remove from queue');
	} catch (error) {
		console.error('[power-actions] Failed to install uninstall guard:', error);
	}

	return () => restores.forEach((restore) => restore());
}
