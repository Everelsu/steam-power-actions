import { definePlugin } from '@steambrew/client';
import { initDownloadsButton } from './downloadsButton';
import { initDownloadWatcher } from './downloadWatcher';
import { SettingsPanel } from './SettingsPanel';
import { initSettings } from './settings';
import { initUninstallGuard } from './uninstallGuard';

const PluginIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 3v9" />
		<path d="M7.5 6.5a7 7 0 1 0 9 0" />
	</svg>
);

export default definePlugin(() => {
	let disposeSettings: (() => void) | undefined;
	initSettings().then((dispose) => {
		disposeSettings = dispose;
	});
	const disposeWatcher = initDownloadWatcher();
	const disposeButton = initDownloadsButton();
	// Disarm the moment the user removes/uninstalls a game, so a removal near
	// completion can never be misread as a finish and shut the PC down.
	const disposeUninstallGuard = initUninstallGuard();

	return {
		title: 'Power Actions',
		icon: <PluginIcon />,
		content: <SettingsPanel />,
		onDismount() {
			disposeUninstallGuard();
			disposeButton();
			disposeWatcher();
			disposeSettings?.();
		},
	};
});
