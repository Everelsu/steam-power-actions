import { CSSProperties, FC, useSyncExternalStore } from 'react';
import { actionLabel } from './actions';
import { toggleArmPanel } from './ArmPanel';
import { t } from './i18n';
import { getSettings, getSettingsVersion, subscribeSettings } from './settings';

const PowerIcon: FC = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 3v9" />
		<path d="M7.5 6.5a7 7 0 1 0 9 0" />
	</svg>
);

export interface ArmButtonProps {
	/** Class list cloned from the native downloads settings gear. */
	nativeClassName?: string;
	/** Position + visuals computed from the live gear element at inject time. */
	style?: CSSProperties;
}

/**
 * The button injected next to the downloads page settings gear. Lights up
 * Steam-blue while armed; clicking toggles the picker panel.
 */
export const ArmButton: FC<ArmButtonProps> = ({ nativeClassName, style }) => {
	useSyncExternalStore(subscribeSettings, getSettingsVersion);
	const settings = getSettings();
	const isArmed = settings.armed;
	const title = isArmed ? `${actionLabel(settings.action)} — ${t().menuTitle}` : t().menuTitle;

	return (
		<button
			className={`${nativeClassName ?? ''} pa-arm-button${isArmed ? ' pa-armed' : ''}`.trim()}
			style={style}
			data-pa-tip={title}
			onClick={(e) => toggleArmPanel(e.currentTarget)}
		>
			<PowerIcon />
		</button>
	);
};
