import {MarkdownView, Notice, Plugin} from 'obsidian';
import {combineConfig, Compartment, Facet, Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import cloneDeep from 'lodash.clonedeep';
import {EditorView} from "@codemirror/view";
import {newLineDecoration} from "./NewLineDecoration";
import {inlineDecoration} from "./InlineCharacterDecoration";

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

export const staticConfig = Facet.define<ControlCharacterSettings, Required<ControlCharacterSettings>>({
	combine(options: readonly ControlCharacterSettings[]) {
		return combineConfig(options, DEFAULT_SETTINGS, {
			newLine: (a, b) => a || b,
			tab: (a, b) => a || b,
			space: (a, b) => a || b,
			enabled: (a, b) => a || b,
		});
	},
});

export default class ControlCharacterPlugin extends Plugin {
	settings: ControlCharacterSettings;

	async onload() {
		if (!(this.app.vault as any).config?.legacyEditor) {
			await this.loadSettings();

			const compartment1 = new Compartment();
			const compartment2 = new Compartment();

			const inlineExtension = Prec.lowest(inlineDecoration(this));
			const newLineExtension = Prec.lowest(newLineDecoration(this));

			const options = cloneDeep(this.settings);

			this.registerEditorExtension([newLineExtension, compartment1.of(staticConfig.of(options))]);
			this.registerEditorExtension([inlineExtension, compartment2.of(staticConfig.of(options))]);

			this.addSettingTab(new ControlCharactersSettingsTab(this));


			this.addCommand({
				id: "toggle",
				name: "Show/hide control characters",
				callback: async () => {
					this.settings.enabled = !this.settings.enabled;
					await this.saveSettings();
					const options = cloneDeep(this.settings);
					this.app.workspace.iterateAllLeaves(leaf => {
						if (leaf?.view instanceof MarkdownView && (leaf.view.editor as any)?.cm instanceof EditorView) {
							//@ts-ignore
							leaf.view.editor.cm.dispatch({
								effects: [
									compartment1.reconfigure(staticConfig.of(options)),
									compartment2.reconfigure(staticConfig.of(options))
								]
							})

						}
					});

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
