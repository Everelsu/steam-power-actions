import { FC, ReactNode, useSyncExternalStore } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { actionLabel, POWER_ACTIONS } from './actions';
import { t } from './i18n';
import { downloadsClasses } from './downloadsClasses';
import { getQueueCandidates } from './downloadWatcher';
import { getSettings, getSettingsVersion, isActionEnabled, setAction, setArmed, setCountdownSeconds, setOnlyWhenInstalling, setWatchedApps, subscribeSettings, toggleWatchedApp } from './settings';

const PANEL_ID = 'pa-panel';
const STYLE_ID = 'pa-panel-style';
const COUNTDOWN_CHOICES = [10, 30, 60, 120];

const CSS = `
#${PANEL_ID} {
	position: fixed;
	z-index: 100001;
	width: 300px;
	background: #23262e;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 4px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
	color: #dcdedf;
	font-family: "Motiva Sans", "Segoe UI", Arial, sans-serif;
	font-size: 13px;
	padding: 4px 0 6px;
	animation: pa-panel-in 0.12s ease-out;
	user-select: none;
}
@keyframes pa-panel-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
#${PANEL_ID} .pa-h {
	padding: 9px 14px 4px;
	font-size: 11px;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #8f98a0;
}
#${PANEL_ID} .pa-row { display: flex; align-items: center; gap: 10px; padding: 7px 14px; cursor: pointer; }
#${PANEL_ID} .pa-row:hover { background: #2e3239; }
#${PANEL_ID} .pa-row.pa-sel { color: #fff; }
#${PANEL_ID} .pa-row.pa-off { color: #5b636b; cursor: default; }
#${PANEL_ID} .pa-row.pa-off:hover { background: none; }
#${PANEL_ID} .pa-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#${PANEL_ID} .pa-radio {
	box-sizing: border-box;
	width: 16px; height: 16px; flex: 0 0 auto;
	border-radius: 50%;
	border: 2px solid #6b7683;
	position: relative;
	transition: border-color 0.1s;
}
#${PANEL_ID} .pa-row:hover .pa-radio { border-color: #99a1ab; }
#${PANEL_ID} .pa-row.pa-sel .pa-radio { border-color: #1a9fff; }
#${PANEL_ID} .pa-row.pa-sel .pa-radio::after {
	content: "";
	position: absolute;
	top: 50%; left: 50%;
	width: 8px; height: 8px;
	border-radius: 50%;
	background: #1a9fff;
	transform: translate(-50%, -50%);
}
#${PANEL_ID} .pa-check {
	box-sizing: border-box;
	width: 16px; height: 16px; flex: 0 0 auto;
	border-radius: 3px;
	border: 2px solid #6b7683;
	display: flex; align-items: center; justify-content: center;
	font-size: 11px; line-height: 1;
	color: transparent;
	transition: border-color 0.1s, background 0.1s;
}
#${PANEL_ID} .pa-row:hover .pa-check { border-color: #99a1ab; }
#${PANEL_ID} .pa-row.pa-sel .pa-check { background: #1a9fff; border-color: #1a9fff; color: #fff; }
#${PANEL_ID} .pa-sep { height: 1px; background: rgba(255, 255, 255, 0.07); margin: 5px 0; }
#${PANEL_ID} .pa-chips { display: flex; gap: 6px; padding: 4px 14px 6px; }
#${PANEL_ID} .pa-chip { padding: 3px 10px; border-radius: 3px; background: #2e3239; cursor: pointer; font-size: 12px; color: #b8bcbf; }
#${PANEL_ID} .pa-chip:hover { background: #3a3f47; color: #fff; }
#${PANEL_ID} .pa-chip.pa-sel { background: #1a9fff; color: #fff; }
`;

function appName(appid: number): string {
	try {
		return window.appStore?.GetAppOverviewByAppID?.(appid)?.display_name ?? `App ${appid}`;
	} catch {
		return `App ${appid}`;
	}
}

function appidFromArtworkUrl(url: string): number {
	if (!url || !/librarycache|steam\/apps|library_|_hero|_header|capsule/.test(url)) return 0;
	const match = /(\d{3,})/.exec(url);
	return match ? Number(match[1]) : 0;
}

/** Watcher candidates + artwork scan of the downloads page DOM. */
function queueAppIds(doc: Document): number[] {
	const ids = new Set<number>(getQueueCandidates());
	const cls = downloadsClasses();
	const page = cls ? doc.querySelector(`.${cls.DownloadsPage}`) : null;
	if (page) {
		for (const img of Array.from(page.querySelectorAll<HTMLImageElement>('img'))) {
			const id = appidFromArtworkUrl(img.src ?? '');
			if (id > 0) ids.add(id);
		}
		for (const el of Array.from(page.querySelectorAll<HTMLElement>('[style*="background"]'))) {
			const id = appidFromArtworkUrl(el.style.backgroundImage ?? '');
			if (id > 0) ids.add(id);
		}
	}
	return [...ids];
}

interface RowProps {
	kind: 'radio' | 'check';
	selected: boolean;
	disabled?: boolean;
	onClick?: () => void;
	children: ReactNode;
}

const Row: FC<RowProps> = ({ kind, selected, disabled, onClick, children }) => (
	<div className={`pa-row${selected ? ' pa-sel' : ''}${disabled ? ' pa-off' : ''}`} onClick={disabled ? undefined : onClick}>
		{kind === 'radio' ? <span className="pa-radio" /> : <span className="pa-check">✓</span>}
		<span className="pa-label">{children}</span>
	</div>
);

const ArmPanel: FC<{ doc: Document }> = ({ doc }) => {
	useSyncExternalStore(subscribeSettings, getSettingsVersion);
	const settings = getSettings();

	const strings = t();
	const isArmed = settings.armed;
	const currentAction = settings.action;
	const currentCountdown = settings.countdownSeconds;
	const watched = settings.watchedApps;
	const queue = queueAppIds(doc);

	return (
		<>
			<div className="pa-h">{strings.menuTitle}</div>
			<Row kind="radio" selected={!isArmed} onClick={() => setArmed(false)}>
				{strings.doNothing}
			</Row>
			{POWER_ACTIONS.filter((entry) => isActionEnabled(entry.id)).map((entry) => (
				<Row
					key={entry.id}
					kind="radio"
					selected={isArmed && currentAction === entry.id}
					onClick={() => {
						setAction(entry.id);
						setArmed(true);
					}}
				>
					{actionLabel(entry.id)}
				</Row>
			))}
			{queue.length > 0 && (
				<>
					<div className="pa-sep" />
					<div className="pa-h">{strings.waitFor}</div>
					<Row kind="check" selected={watched.length === 0} onClick={() => setWatchedApps([])}>
						{strings.allDownloads}
					</Row>
					{queue.map((appid) => (
						<Row key={appid} kind="check" selected={watched.includes(appid)} onClick={() => toggleWatchedApp(appid)}>
							{appName(appid)}
						</Row>
					))}
				</>
			)}
			<div className="pa-sep" />
			<div className="pa-h">{strings.countdownLabel}</div>
			<div className="pa-chips">
				{COUNTDOWN_CHOICES.map((seconds) => (
					<span key={seconds} className={`pa-chip${currentCountdown === seconds ? ' pa-sel' : ''}`} onClick={() => setCountdownSeconds(seconds)}>
						{seconds}s
					</span>
				))}
			</div>
			<Row kind="check" selected={settings.onlyWhenInstalling} onClick={() => setOnlyWhenInstalling(!settings.onlyWhenInstalling)}>
				{strings.onlyInstalls}
			</Row>
		</>
	);
};

interface OpenPanel {
	host: HTMLElement;
	root: Root;
	cleanup: () => void;
}

let openPanel: OpenPanel | null = null;

export function closeArmPanel(): void {
	if (!openPanel) return;
	const { host, root, cleanup } = openPanel;
	openPanel = null;
	cleanup();
	try {
		root.unmount();
	} catch {
		/* window already gone */
	}
	host.remove();
}

/**
 * Custom Steam-styled picker panel anchored below the injected button. Unlike
 * the native context menu it stays open across clicks, so several games can
 * be ticked in one go, and every choice has a visible radio/check state.
 */
export function toggleArmPanel(button: HTMLElement): void {
	if (openPanel) {
		closeArmPanel();
		return;
	}
	const doc = button.ownerDocument;
	const view = doc.defaultView;
	if (!doc.body || !view) return;

	if (!doc.getElementById(STYLE_ID)) {
		const style = doc.createElement('style');
		style.id = STYLE_ID;
		style.textContent = CSS;
		doc.head.appendChild(style);
	}

	const rect = button.getBoundingClientRect();
	const host = doc.createElement('div');
	host.id = PANEL_ID;
	host.style.top = `${Math.round(rect.bottom + 8)}px`;
	host.style.right = `${Math.max(8, Math.round(view.innerWidth - rect.right))}px`;
	doc.body.appendChild(host);

	const root = createRoot(host);
	root.render(<ArmPanel doc={doc} />);

	const onPointerDown = (e: Event) => {
		const target = e.target as Node | null;
		if (target && (host.contains(target) || button.contains(target))) return;
		closeArmPanel();
	};
	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') closeArmPanel();
	};
	const onUnload = () => closeArmPanel();

	doc.addEventListener('mousedown', onPointerDown, true);
	doc.addEventListener('keydown', onKeyDown, true);
	view.addEventListener('unload', onUnload, { once: true });

	openPanel = {
		host,
		root,
		cleanup: () => {
			doc.removeEventListener('mousedown', onPointerDown, true);
			doc.removeEventListener('keydown', onKeyDown, true);
			view.removeEventListener('unload', onUnload);
		},
	};
}
