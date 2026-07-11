import { callable } from '@steambrew/client';
import { actionById, PowerActionId } from './actions';
import { startCountdown } from './countdown';
import { getSettings, setArmed } from './settings';

const performPowerAction = callable<[{ action: string }], string>('perform_power_action');

let running = false;

/**
 * Runs the configured action after a cancellable countdown. Disarms first so a
 * later download burst can't retrigger it, and guards against overlapping runs.
 * Returns true if the action actually fired.
 */
export async function runPowerAction(reason: 'auto' | 'test'): Promise<boolean> {
	if (running) return false;
	running = true;
	try {
		const settings = getSettings();
		const action = actionById(settings.action);
		if (reason === 'auto') setArmed(false);

		const shouldRun = await startCountdown(action, Math.max(0, settings.countdownSeconds));
		if (!shouldRun) return false;

		await executeAction(action.id, action.steamClient === true);
		return true;
	} finally {
		running = false;
	}
}

async function executeAction(id: PowerActionId, viaSteamClient: boolean): Promise<void> {
	if (viaSteamClient) {
		try {
			SteamClient.User?.StartShutdown?.(false);
		} catch (error) {
			console.error('[power-actions] Failed to quit Steam:', error);
		}
		return;
	}
	try {
		await performPowerAction({ action: id });
	} catch (error) {
		console.error('[power-actions] Backend power action failed:', error);
	}
}
