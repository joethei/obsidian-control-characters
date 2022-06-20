export interface ControlCharacterSettings {
	newLine: boolean,
	tab: boolean,
	space: boolean,
	enabled: boolean,
	selection: boolean,
}

export const DEFAULT_SETTINGS: ControlCharacterSettings = {
	newLine: true,
	tab: true,
	space: true,
	enabled: true,
	selection: false,
}
