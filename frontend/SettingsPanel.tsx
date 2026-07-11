import { Field, ToggleField } from '@steambrew/client';
import { FC, useSyncExternalStore } from 'react';
import { actionLabel, BASE_ACTIONS, OPTIONAL_ACTIONS } from './actions';
import { getSettingsVersion, isActionEnabled, setActionEnabled, subscribeSettings } from './settings';

export const SettingsPanel: FC = () => {
	useSyncExternalStore(subscribeSettings, getSettingsVersion);


	return (
		<>
			<Field
				label="Menu actions"
				description="Choose which power actions appear in the menu on the Downloads page. Shut down and Restart are always available."
				bottomSeparator="standard"
				focusable
			/>

			{[...BASE_ACTIONS].map((id) => (
				<ToggleField key={id} label={actionLabel(id)} description="Always available" checked disabled />
			))}
			{OPTIONAL_ACTIONS.map((a) => (
				<ToggleField key={a.id} label={actionLabel(a.id)} checked={isActionEnabled(a.id)} onChange={(v) => setActionEnabled(a.id, v)} />
			))}

		</>
	);
};
