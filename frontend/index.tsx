import { definePlugin } from '@steambrew/client';
import { initDownloadsButton } from './downloadsButton';
import { initDownloadWatcher } from './downloadWatcher';
import { SettingsPanel } from './SettingsPanel';
import { initSettings } from './settings';

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
	// NB: availability detection (which spawns powercfg/reg and flashes console
	// windows) is NOT kicked here — it runs lazily only when the user first
	// opens the picker panel, and the result is then cached on disk.

	return {
		title: 'Power Actions',
		icon: <PluginIcon />,
		content: <SettingsPanel />,
		onDismount() {
			disposeButton();
			disposeWatcher();
			disposeSettings?.();
		},
	};
});
