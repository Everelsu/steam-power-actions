import { actionById, actionLabel, PowerAction } from './actions';
import { t } from './i18n';

const STYLE_ID = 'power-actions-style';
const HOST_ID = 'power-actions-countdown';
const MAIN_WINDOW_NAME = 'SP Desktop_uid0';

// Steam-flavoured card: the client's own surface colour (#23262e), an accent
// bar in Steam blue, and buttons matching Steam's flat rectangular style.
const CSS = `
#${HOST_ID} {
	position: fixed;
	right: 20px;
	bottom: 20px;
	z-index: 100000;
	width: 320px;
	border-radius: 4px;
	background: #23262e;
	box-shadow: 0 10px 34px rgba(0, 0, 0, 0.6);
	color: #dcdedf;
	font-family: "Motiva Sans", "Segoe UI", Arial, sans-serif;
	overflow: hidden;
	animation: pa-rise 0.18s ease-out;
}
@keyframes pa-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
#${HOST_ID} .pa-accent { height: 3px; background: linear-gradient(90deg, #1a9fff, #46b1ff); }
#${HOST_ID} .pa-body { padding: 14px 16px 16px; }
#${HOST_ID} .pa-title { font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 3px; }
#${HOST_ID} .pa-sub { font-size: 13px; color: #8f98a0; margin-bottom: 14px; }
#${HOST_ID} .pa-count { color: #1a9fff; font-weight: 700; font-variant-numeric: tabular-nums; }
#${HOST_ID} .pa-row { display: flex; gap: 8px; }
#${HOST_ID} button {
	border: none;
	border-radius: 2px;
	padding: 9px 14px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	font-family: inherit;
	transition: background 0.1s, filter 0.1s;
}
#${HOST_ID} .pa-cancel { flex: 1; background: #3d4450; color: #dcdedf; }
#${HOST_ID} .pa-cancel:hover { background: #4a5361; }
#${HOST_ID} .pa-now { flex: 0 0 auto; background: linear-gradient(90deg, #1a9fff, #06bfff); color: #ffffff; padding-left: 20px; padding-right: 20px; }
#${HOST_ID} .pa-now:hover { filter: brightness(1.12); }
`;

function mainWindow(): Window | null {
	try {
		const popup = g_PopupManager.GetExistingPopup(MAIN_WINDOW_NAME);
		return popup?.m_popup ?? null;
	} catch {
		return null;
	}
}

let activeCleanup: (() => void) | null = null;

export function isCountdownActive(): boolean {
	return activeCleanup !== null;
}

export function cancelCountdown(): void {
	activeCleanup?.();
}

/**
 * Shows a bottom-right countdown card in the main Steam window and resolves
 * with `true` if it runs out, or `false` if the user cancels. Only one can be
 * active at a time; starting a new one cancels the previous.
 */
export function startCountdown(action: PowerAction, seconds: number): Promise<boolean> {
	cancelCountdown();
	const wnd = mainWindow();
	if (!wnd?.document?.body) return Promise.resolve(true);
	const doc = wnd.document;

	if (!doc.getElementById(STYLE_ID)) {
		const style = doc.createElement('style');
		style.id = STYLE_ID;
		style.textContent = CSS;
		doc.head.appendChild(style);
	}

	const strings = t();
	const label = actionLabel(actionById(action.id).id);
	const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
	// The localized "<action> in <n>s" string, with the seconds wrapped in a
	// span we can live-update, regardless of where the number sits per language.
	const subHtml = escapeHtml(strings.countdown(label, seconds)).replace(String(seconds), '<span class="pa-count">$&</span>');

	const host = doc.createElement('div');
	host.id = HOST_ID;
	host.innerHTML = `
		<div class="pa-accent"></div>
		<div class="pa-body">
			<div class="pa-title">${escapeHtml(strings.title)}</div>
			<div class="pa-sub">${subHtml}</div>
			<div class="pa-row">
				<button class="pa-cancel">${escapeHtml(strings.cancel)}</button>
				<button class="pa-now">${escapeHtml(strings.now)}</button>
			</div>
		</div>`;
	doc.body.appendChild(host);

	return new Promise<boolean>((resolve) => {
		let remaining = seconds;
		const countEl = host.querySelector('.pa-count');
		let settled = false;

		const finish = (elapsed: boolean) => {
			if (settled) return;
			settled = true;
			wnd.clearInterval(timer);
			host.remove();
			activeCleanup = null;
			resolve(elapsed);
		};

		const timer = wnd.setInterval(() => {
			remaining -= 1;
			if (countEl) countEl.textContent = String(Math.max(0, remaining));
			if (remaining <= 0) finish(true);
		}, 1000);

		host.querySelector('.pa-cancel')?.addEventListener('click', () => finish(false));
		host.querySelector('.pa-now')?.addEventListener('click', () => finish(true));
		activeCleanup = () => finish(false);
	});
}
