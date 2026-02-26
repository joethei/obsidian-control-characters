export interface ControlCharacterSettings {
	newLine: boolean,
	tab: boolean,
	space: boolean,
	other: boolean,
	otherLabels: boolean,
	enabled: boolean,
	selection: boolean,
	sourceMode: boolean,
	livePreviewMode: boolean,
}

export const DEFAULT_SETTINGS: ControlCharacterSettings = {
	newLine: true,
	tab: true,
	space: true,
	other: true,
	otherLabels: true,
	enabled: true,
	selection: false,
	sourceMode: true,
	livePreviewMode: true,
}
