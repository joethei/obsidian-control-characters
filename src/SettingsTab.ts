import {PluginSettingTab, Setting} from "obsidian";
import ControlCharacterPlugin from "./main";

export class ControlCharactersSettingsTab extends PluginSettingTab {
	private plugin: ControlCharacterPlugin;

	constructor(plugin: ControlCharacterPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): any {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Control Characters'});

		new Setting(containerEl)
			.setName("Space")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.space)
					.onChange(async(value) => {
						this.plugin.settings.space = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Tab")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tab)
					.onChange(async(value) => {
						this.plugin.settings.tab = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("New line")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.newLine)
					.onChange(async(value) => {
						this.plugin.settings.newLine = value;
						await this.plugin.saveSettings();
					});
			});
	}

}
