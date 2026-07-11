import { pluginConfig, subscribePluginConfig } from '@steambrew/client';
import { isBaseAction, OPTIONAL_ACTIONS, PowerActionId } from './actions';

export interface PowerSettings {
	action: PowerActionId;
	armed: boolean;
	countdownSeconds: number;
	onlyWhenInstalling: boolean;
	/** Appids to wait for; empty = wait for the whole queue. Stored as JSON for Lua round-trip safety. */
	watchedApps: number[];
	/** Optional actions the user has enabled to show in the menu (base actions are always shown). */
	enabledActions: PowerActionId[];
}

const ALL_OPTIONAL = OPTIONAL_ACTIONS.map((a) => a.id);

export const DEFAULT_SETTINGS: PowerSettings = {
	action: 'shutdown',
	armed: false,
	countdownSeconds: 30,
	onlyWhenInstalling: false,
	watchedApps: [],
	enabledActions: [...ALL_OPTIONAL],
};

const cache: PowerSettings = { ...DEFAULT_SETTINGS, watchedApps: [], enabledActions: [...ALL_OPTIONAL] };

const listeners = new Set<() => void>();
let version = 0;

function bump(): void {
	version += 1;
	listeners.forEach((listener) => listener());
}

/** useSyncExternalStore-compatible subscription for UI that reads getSettings(). */
export function subscribeSettings(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getSettingsVersion(): number {
	return version;
}

export function getSettings(): Readonly<PowerSettings> {
	return cache;
}

/** Base actions are always available; optional ones only when the user enabled them. */
export function isActionEnabled(id: PowerActionId): boolean {
	return isBaseAction(id) || cache.enabledActions.includes(id);
}

export function setArmed(armed: boolean): void {
	cache.armed = armed;
	bump();
	pluginConfig.set('armed', armed).catch((error) => console.error('[power-actions] Failed to persist armed:', error));
}

export function setAction(action: PowerActionId): void {
	cache.action = action;
	bump();
	pluginConfig.set('action', action).catch((error) => console.error('[power-actions] Failed to persist action:', error));
}

export function setCountdownSeconds(seconds: number): void {
	cache.countdownSeconds = seconds;
	bump();
	pluginConfig.set('countdownSeconds', seconds).catch((error) => console.error('[power-actions] Failed to persist countdownSeconds:', error));
}

export function setOnlyWhenInstalling(value: boolean): void {
	cache.onlyWhenInstalling = value;
	bump();
	pluginConfig.set('onlyWhenInstalling', value).catch((error) => console.error('[power-actions] Failed to persist onlyWhenInstalling:', error));
}

export function setWatchedApps(appids: number[]): void {
	cache.watchedApps = appids;
	bump();
	pluginConfig.set('watchedApps', JSON.stringify(appids)).catch((error) => console.error('[power-actions] Failed to persist watchedApps:', error));
}

export function toggleWatchedApp(appid: number): void {
	const current = cache.watchedApps;
	setWatchedApps(current.includes(appid) ? current.filter((id) => id !== appid) : [...current, appid]);
}

export function setActionEnabled(id: PowerActionId, enabled: boolean): void {
	if (isBaseAction(id)) return;
	const next = enabled ? [...new Set([...cache.enabledActions, id])] : cache.enabledActions.filter((a) => a !== id);
	cache.enabledActions = next;
	// If the currently-armed action was just disabled, disarm so nothing
	// unexpected fires.
	if (!enabled && cache.armed && cache.action === id) {
		cache.armed = false;
		pluginConfig.set('armed', false).catch((error) => console.error('[power-actions] Failed to persist armed:', error));
	}
	bump();
	pluginConfig.set('enabledActions', JSON.stringify(next)).catch((error) => console.error('[power-actions] Failed to persist enabledActions:', error));
}

function parseActionList(value: string): PowerActionId[] | null {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!Array.isArray(parsed)) return null;
		const result: PowerActionId[] = [];
		for (const id of parsed as unknown[]) {
			if (typeof id === 'string' && ALL_OPTIONAL.includes(id as PowerActionId)) {
				result.push(id as PowerActionId);
			}
		}
		return result;
	} catch {
		return null;
	}
}

function assign(key: string, value: unknown): void {
	if (key === 'action' && typeof value === 'string') {
		cache.action = value as PowerActionId;
	} else if (key === 'countdownSeconds' && typeof value === 'number') {
		cache.countdownSeconds = value;
	} else if ((key === 'armed' || key === 'onlyWhenInstalling') && typeof value === 'boolean') {
		cache[key] = value;
	} else if (key === 'watchedApps' && typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) cache.watchedApps = parsed.filter((id) => typeof id === 'number');
		} catch {
			/* keep previous list */
		}
	} else if (key === 'enabledActions' && typeof value === 'string') {
		const parsed = parseActionList(value);
		if (parsed) cache.enabledActions = parsed;
	} else {
		return;
	}
	bump();
}

export async function initSettings(): Promise<() => void> {
	try {
		const all = await pluginConfig.getAll<Record<string, unknown>>();
		for (const [key, value] of Object.entries(all ?? {})) {
			assign(key, value);
		}
	} catch (error) {
		console.error('[power-actions] Failed to load settings:', error);
	}
	return subscribePluginConfig((key, value) => assign(key, value));
}
