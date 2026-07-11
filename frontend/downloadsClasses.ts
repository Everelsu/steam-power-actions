import { findModule } from '@steambrew/client';

/** CSS-module classes of the client's downloads page. */
export interface DownloadsPageClasses {
	DownloadsPage: string;
	TopSection: string;
	SettingsButton: string;
}

let cached: DownloadsPageClasses | null = null;

export function downloadsClasses(): DownloadsPageClasses | null {
	if (cached) return cached;
	try {
		const found = findModule((m) => m?.DownloadsPage && m?.TopSection && m?.SettingsButton && m?.PauseResumeButton);
		if (found) cached = found as DownloadsPageClasses;
	} catch {
		/* webpack modules not ready yet */
	}
	return cached;
}
