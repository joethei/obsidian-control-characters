import {Notice, Plugin} from 'obsidian';
import { Extension, Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import {newLineDecoration} from "./NewLineDecoration";

interface ControlCharacterSettings {
	newLine: boolean,
	tab: boolean,
	space: boolean,
	enabled: boolean,
}

const DEFAULT_SETTINGS: ControlCharacterSettings = {
	newLine: true,
	tab: true,
	space: true,
	enabled: true,
}


export default class ControlCharacterPlugin extends Plugin {
	settings: ControlCharacterSettings;
	enabledExtensions: Extension[] = [];

	newLineExtension: Extension = Prec.lowest(newLineDecoration(this));


	async onload() {
		if (!(this.app.vault as any).config?.legacyEditor) {
			await this.loadSettings();

			if(this.settings.enabled) {
				this.enabledExtensions.push(this.newLineExtension);
			}

			this.registerEditorExtension(this.enabledExtensions);

			this.addSettingTab(new ControlCharactersSettingsTab(this));


			this.addCommand({
				id: "toggle",
				name: "Show/hide control characters",
				callback: async () => {
					this.settings.enabled = !this.settings.enabled;
					await this.saveSettings();
					if(!this.settings.enabled) {
						while(this.enabledExtensions.length > 0) {
							this.enabledExtensions.pop();
						}
					}else {
						this.enabledExtensions.push(this.newLineExtension);
					}

					this.app.workspace.updateOptions();

				}
			})

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
