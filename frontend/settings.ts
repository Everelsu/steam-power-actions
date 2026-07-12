import { callable, pluginConfig, subscribePluginConfig } from '@steambrew/client';
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

export interface CountdownMeta {
	min: number;
	max: number;
	step: number;
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

const DEFAULT_COUNTDOWN_META: CountdownMeta = { min: 5, max: 120, step: 5 };

// Every write goes through the Lua backend, which validates/clamps and then
// persists — so the rules live in one place (see backend/main.lua).
const luaSetSetting = callable<[{ key: string; value: string | number | boolean }], string>('set_setting');
const luaGetMeta = callable<[], string>('get_settings_meta');

function persist(key: string, value: string | number | boolean): void {
	luaSetSetting({ key, value }).catch((error) => console.error(`[power-actions] Failed to persist ${key}:`, error));
}

const cache: PowerSettings = { ...DEFAULT_SETTINGS, watchedApps: [], enabledActions: [...ALL_OPTIONAL] };
let countdownMeta: CountdownMeta = { ...DEFAULT_COUNTDOWN_META };

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

export function getCountdownMeta(): Readonly<CountdownMeta> {
	return countdownMeta;
}

/** Base actions are always available; optional ones only when the user enabled them. */
export function isActionEnabled(id: PowerActionId): boolean {
	return isBaseAction(id) || cache.enabledActions.includes(id);
}

export function setArmed(armed: boolean): void {
	cache.armed = armed;
	bump();
	persist('armed', armed);
}

export function setAction(action: PowerActionId): void {
	cache.action = action;
	bump();
	persist('action', action);
}

export function setCountdownSeconds(seconds: number): void {
	cache.countdownSeconds = seconds;
	bump();
	persist('countdownSeconds', seconds);
}

export function setOnlyWhenInstalling(value: boolean): void {
	cache.onlyWhenInstalling = value;
	bump();
	persist('onlyWhenInstalling', value);
}

export function setWatchedApps(appids: number[]): void {
	cache.watchedApps = appids;
	bump();
	persist('watchedApps', JSON.stringify(appids));
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
		persist('armed', false);
	}
	bump();
	persist('enabledActions', JSON.stringify(next));
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

	luaGetMeta()
		.then((raw) => {
			const meta = JSON.parse(raw) as { countdown?: Partial<CountdownMeta> };
			if (meta.countdown) {
				countdownMeta = { ...DEFAULT_COUNTDOWN_META, ...meta.countdown };
				bump();
			}
		})
		.catch(() => {
			/* keep default range */
		});

	return subscribePluginConfig((key, value) => assign(key, value));
}
