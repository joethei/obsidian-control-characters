import {Notice, Plugin} from 'obsidian';
import {Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import {inlineCharacterDecoration} from "./InlineCharacterDecoration";
import {newLineDecoration} from "./NewLineDecoration";

interface ControlCharacterSettings {
	newLine: boolean,
	tab: boolean,
	space: boolean
}

const DEFAULT_SETTINGS: ControlCharacterSettings = {
	newLine: true,
	tab: true,
	space: true
}

export default class ControlCharacterPlugin extends Plugin {
	settings: ControlCharacterSettings;

	async onload() {
		if ((this.app.vault as any).config?.legacyEditor) {
			await this.loadSettings();
			this.registerEditorExtension(Prec.lowest(inlineCharacterDecoration(this)));
			this.registerEditorExtension(Prec.lowest(newLineDecoration(this)));

			this.addSettingTab(new ControlCharactersSettingsTab(this));
		} else {
			new Notice("Control Characters: You are using the legacy editor, this plugin is not supported there");
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
