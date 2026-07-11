import { Millennium } from '@steambrew/client';
import { CSSProperties } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ArmButton } from './ArmMenu';
import { closeArmPanel } from './ArmPanel';
import { downloadsClasses } from './downloadsClasses';

const HOST_ID = 'power-actions-arm';
const STYLE_ID = 'power-actions-arm-style';
const MAIN_WINDOW_PREFIX = 'SP Desktop';

const CSS = `
#${HOST_ID} { display: contents; }
#${HOST_ID} .pa-arm-button {
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	cursor: pointer;
	padding: 0;
	overflow: visible;
}
#${HOST_ID} .pa-arm-button:hover { filter: brightness(1.25); }
#${HOST_ID} .pa-arm-button svg { pointer-events: none; }
/* Matches the Steam client's own button tooltips: dark steel box, light
   steel text, thin border, subtle shadow, short reveal delay. */
#${HOST_ID} .pa-arm-button[data-pa-tip]::after {
	content: attr(data-pa-tip);
	position: absolute;
	top: calc(100% + 9px);
	right: 0;
	white-space: nowrap;
	background: #171d25;
	color: #c6d4df;
	font-family: "Motiva Sans", "Segoe UI", Arial, sans-serif;
	font-size: 12px;
	font-weight: 400;
	line-height: 1.3;
	padding: 6px 10px;
	border: 1px solid #000000;
	border-radius: 3px;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
	opacity: 0;
	pointer-events: none;
	transform: translateY(-3px);
	transition: opacity 0.12s ease, transform 0.12s ease;
	transition-delay: 0s;
	z-index: 200;
}
#${HOST_ID} .pa-arm-button[data-pa-tip]:hover::after {
	opacity: 1;
	transform: none;
	transition-delay: 0.3s;
}
#${HOST_ID} .pa-arm-button.pa-armed,
#${HOST_ID} .pa-arm-button.pa-armed:hover {
	color: #1a9fff;
}
#${HOST_ID} .pa-arm-button.pa-armed svg {
	filter: drop-shadow(0 0 6px rgba(26, 159, 255, 0.8));
}
`;

interface Injection {
	host: HTMLElement;
	root: Root;
}

let disposed = false;
const observers = new Set<MutationObserver>();
const injections = new Set<Injection>();

/**
 * Watches the main window for the downloads page and mounts the arm button
 * directly below the page's settings gear, cloning the gear's class list so
 * the two buttons look identical. The observer callback is rAF-debounced and
 * O(1) while the button is mounted.
 */
export function initDownloadsButton(): () => void {
	disposed = false;

	Millennium.AddWindowCreateHook?.((context) => {
		const popup = context as SteamPopup;
		if (popup?.m_popup && popup.m_strName?.startsWith(MAIN_WINDOW_PREFIX)) {
			watchWindow(popup.m_popup);
		}
	});

	try {
		for (const popup of g_PopupManager.GetPopups()) {
			if (popup?.m_popup && popup.m_strName?.startsWith(MAIN_WINDOW_PREFIX)) {
				watchWindow(popup.m_popup);
			}
		}
	} catch {
		/* g_PopupManager not ready yet */
	}

	return () => {
		disposed = true;
		closeArmPanel();
		for (const observer of observers) observer.disconnect();
		observers.clear();
		for (const injection of injections) removeInjection(injection);
		injections.clear();
	};
}

function watchWindow(wnd: Window): void {
	let doc: Document;
	try {
		doc = wnd.document;
	} catch {
		return;
	}
	if (!doc?.documentElement || doc.documentElement.dataset.paDownloadsWatch) return;
	doc.documentElement.dataset.paDownloadsWatch = '1';

	let scheduled = false;
	const check = () => {
		scheduled = false;
		if (!disposed) tryInject(doc);
	};
	const observer = new MutationObserver(() => {
		if (scheduled) return;
		scheduled = true;
		wnd.requestAnimationFrame(check);
	});

	const start = () => {
		if (disposed) return;
		if (!doc.body) {
			wnd.setTimeout(start, 500);
			return;
		}
		observer.observe(doc.body, { childList: true, subtree: true });
		observers.add(observer);
		tryInject(doc);
	};
	start();

	wnd.addEventListener('unload', () => observer.disconnect(), { once: true });
}

function tryInject(doc: Document): void {
	const existing = doc.getElementById(HOST_ID);
	if (existing?.isConnected) return;

	const cls = downloadsClasses();
	if (!cls) return;
	const gear = doc.querySelector<HTMLElement>(`.${cls.DownloadsPage} .${cls.TopSection} .${cls.SettingsButton}`);
	if (!gear?.parentElement) return;

	if (existing) existing.remove();

	if (!doc.getElementById(STYLE_ID)) {
		const style = doc.createElement('style');
		style.id = STYLE_ID;
		style.textContent = CSS;
		doc.head.appendChild(style);
	}

	const host = doc.createElement('div');
	host.id = HOST_ID;
	gear.parentElement.insertBefore(host, gear.nextSibling);

	// Copy the gear's computed look (size, background, radius, colour) so the
	// two buttons are visually identical regardless of what classes produce
	// it, and sit on the same row immediately to its left — below it the
	// download progress readouts live, and covering those was ugly.
	const view = doc.defaultView;
	const computed = view?.getComputedStyle(gear);
	let style: CSSProperties | undefined;
	if (computed) {
		style = {
			width: gear.offsetWidth || undefined,
			height: gear.offsetHeight || undefined,
			borderRadius: computed.borderRadius,
			color: computed.color,
			backgroundColor:
				computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent'
					? computed.backgroundColor
					: 'rgba(61, 67, 75, 0.9)',
		};
		if (computed.position === 'absolute') {
			const gearRight = computed.right !== 'auto' ? Number.parseFloat(computed.right) || 0 : 0;
			style.position = 'absolute';
			style.top = gear.offsetTop;
			style.right = gearRight + gear.offsetWidth + 8;
			style.zIndex = 4;
		}
	}

	const root = createRoot(host);
	root.render(<ArmButton nativeClassName={gear.className} style={style} />);
	injections.add({ host, root });
	// Availability is intentionally NOT probed here — see index.tsx. It would
	// spawn console-flashing processes just from opening the downloads page.
}

function removeInjection(injection: Injection): void {
	try {
		injection.root.unmount();
	} catch {
		/* window already gone */
	}
	injection.host.remove();
}
