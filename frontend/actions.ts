import { t } from './i18n';

export type PowerActionId = 'shutdown' | 'restart' | 'sleep' | 'hibernate' | 'lock' | 'quitsteam';

export interface PowerAction {
	id: PowerActionId;
	/** Handled in the frontend via SteamClient rather than an OS shell command. */
	steamClient?: boolean;
}

export const POWER_ACTIONS: PowerAction[] = [
	{ id: 'shutdown' },
	{ id: 'restart' },
	{ id: 'sleep' },
	{ id: 'hibernate' },
	{ id: 'lock' },
	{ id: 'quitsteam', steamClient: true },
];

/** Always available, can't be turned off — the plugin's baseline. */
export const BASE_ACTIONS = new Set<PowerActionId>(['shutdown', 'restart']);

/** Actions the user can enable/disable in settings. */
export const OPTIONAL_ACTIONS: PowerAction[] = POWER_ACTIONS.filter((a) => !BASE_ACTIONS.has(a.id));

export function isBaseAction(id: PowerActionId): boolean {
	return BASE_ACTIONS.has(id);
}

export function actionById(id: string | undefined): PowerAction {
	return POWER_ACTIONS.find((action) => action.id === id) ?? POWER_ACTIONS[0];
}

/** Localized display label for an action. */
export function actionLabel(id: PowerActionId): string {
	return t().actions[id];
}
