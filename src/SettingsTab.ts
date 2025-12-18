import {PluginSettingTab, Setting} from "obsidian";
import ControlCharacterPlugin from "./main";

export class ControlCharactersSettingsTab extends PluginSettingTab {
	private plugin: ControlCharacterPlugin;

	constructor(plugin: ControlCharacterPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Only show control characters in selection")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.selection)
					.onChange(async (value) => {
						this.plugin.settings.selection = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Show in Source mode')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.sourceMode)
					.onChange(async(value) => {
						this.plugin.settings.sourceMode = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Show in Live preview mode')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.livePreviewMode)
					.onChange(async(value) => {
						this.plugin.settings.livePreviewMode = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl).setName('Characters').setHeading();

		new Setting(containerEl)
			.setName("Space")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.space)
					.onChange(async (value) => {
						this.plugin.settings.space = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Tab")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tab)
					.onChange(async (value) => {
						this.plugin.settings.tab = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("New line")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.newLine)
					.onChange(async (value) => {
						this.plugin.settings.newLine = value;
						await this.plugin.saveSettings();
					});
			});
	}

}
