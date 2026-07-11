interface SteamPopup {
	m_strName: string;
	m_popup: Window;
}

declare const g_PopupManager: {
	GetPopups(): SteamPopup[];
	GetExistingPopup(name: string): SteamPopup | undefined;
	AddPopupCreatedCallback(callback: (popup: SteamPopup) => void): void;
};
