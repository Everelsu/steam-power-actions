import { Field, ToggleField } from '@steambrew/client';
import { FC, useSyncExternalStore } from 'react';
import { actionLabel, BASE_ACTIONS, OPTIONAL_ACTIONS } from './actions';
import { tSettings } from './i18n';
import { getSettingsVersion, isActionEnabled, setActionEnabled, subscribeSettings } from './settings';

export const SettingsPanel: FC = () => {
	useSyncExternalStore(subscribeSettings, getSettingsVersion);
	const s = tSettings();
	const baseIds = [...BASE_ACTIONS];

	return (
		<>
			<Field label={s.menuActions} description={s.menuActionsDesc} bottomSeparator="standard" focusable />

			{baseIds.map((id) => (
				<ToggleField key={id} label={actionLabel(id)} description={s.alwaysAvailable} checked disabled />
			))}
			{OPTIONAL_ACTIONS.map((a, index) => (
				<ToggleField
					key={a.id}
					label={actionLabel(a.id)}
					checked={isActionEnabled(a.id)}
					onChange={(value) => setActionEnabled(a.id, value)}
					bottomSeparator={index === OPTIONAL_ACTIONS.length - 1 ? 'none' : 'standard'}
				/>
			))}
		</>
	);
};
