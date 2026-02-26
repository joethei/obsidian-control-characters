import { PluginSettingTab, Setting, SettingGroup } from "obsidian";
import ControlCharacterPlugin from "./main";

export class ControlCharactersSettingsTab extends PluginSettingTab {
	private plugin: ControlCharacterPlugin;
	icon = "pilcrow";

	constructor(plugin: ControlCharacterPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		let otherLabelsSettingEl: HTMLElement | null = null;

		new SettingGroup(containerEl)
			.addSetting((setting) => {
				setting
					.setName("Only show control characters in selection")
					.addToggle((toggle) => {
						toggle
							.setValue(this.plugin.settings.selection)
							.onChange(async (value) => {
								this.plugin.settings.selection = value;
								await this.plugin.saveSettings();
							});
					});
			})
			.addSetting((setting) => {
				setting.setName("Show in Source mode").addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.sourceMode)
						.onChange(async (value) => {
							this.plugin.settings.sourceMode = value;
							await this.plugin.saveSettings();
						});
				});
			})
			.addSetting((setting) => {
				setting
					.setName("Show in Live preview mode")
					.addToggle((toggle) => {
						toggle
							.setValue(this.plugin.settings.livePreviewMode)
							.onChange(async (value) => {
								this.plugin.settings.livePreviewMode = value;
								await this.plugin.saveSettings();
							});
					});
			});

		new SettingGroup(containerEl)
			.setHeading("Characters")
			.addSetting((setting) => {
				setting.setName("Space").addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.space)
						.onChange(async (value) => {
							this.plugin.settings.space = value;
							await this.plugin.saveSettings();
						});
				});
			})
			.addSetting((setting) => {
				setting.setName("Tab").addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.tab)
						.onChange(async (value) => {
							this.plugin.settings.tab = value;
							await this.plugin.saveSettings();
						});
				});
			})
			.addSetting((setting) => {
				setting.setName("New line").addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.newLine)
						.onChange(async (value) => {
							this.plugin.settings.newLine = value;
							await this.plugin.saveSettings();
						});
				});
			})
			.addSetting((setting) => {
				setting
					.setName("Other invisible Unicode characters")
					.setDesc("Zero-width and non-printing characters")
					.addToggle((toggle) => {
						toggle
							.setValue(this.plugin.settings.other)
							.onChange(async (value) => {
								this.plugin.settings.other = value;
								await this.plugin.saveSettings();
								if (otherLabelsSettingEl) {
									otherLabelsSettingEl.style.display = value
										? ""
										: "none";
								}
							});
					});
			})
			.addSetting((setting) => {
				otherLabelsSettingEl = setting.settingEl;
				setting.settingEl.style.display = this.plugin.settings.other
					? ""
					: "none";
				setting.settingEl.style.paddingLeft = "2em";
				setting
					.setName("Show Unicode code point labels")
					.setDesc("(e.g. U+200B)")
					.addToggle((toggle) => {
						toggle
							.setValue(this.plugin.settings.otherLabels)
							.onChange(async (value) => {
								this.plugin.settings.otherLabels = value;
								await this.plugin.saveSettings();
							});
					});
			});

		const infoEl = containerEl.createEl("p");
		infoEl.appendText("Some invisible characters may show up in red. ");
		infoEl.createEl("strong", { text: "It's not a bug" });
		infoEl.appendText(
			" - it's to alert you to the behavior of certain invisible characters (such as U+200C, U+200D, U+FE0E, U+FE0F), which have a special Unicode property that prevents the cursor from being placed between them and the character immediately before them. ",
		);
		infoEl.createEl("a", {
			text: "If you'd like to read about grapheme cluster rules, here's a link",
			href: "https://www.unicode.org/reports/tr29/tr29-44.html",
		});
		infoEl.appendText(". ");
		infoEl.createEl("span", {
			text: "(Nerd.)",
			attr: { style: "font-size: 0.8em; color: var(--text-muted);" },
		});
	}
}
