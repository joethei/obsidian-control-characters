import { Plugin } from 'obsidian';
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
		await this.loadSettings();
		this.registerEditorExtension(Prec.lowest(inlineCharacterDecoration(this)));
		this.registerEditorExtension(Prec.lowest(newLineDecoration(this)));

		this.addSettingTab(new ControlCharactersSettingsTab(this));
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
