import {Notice, Plugin} from 'obsidian';
import {Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import {normalDecoration} from "./NormalDecoration";
import {ControlCharacterSettings, DEFAULT_SETTINGS} from "./settings";
import {selectionDecorations} from "./SelectionHighlight";
import {ControlCharacter, TokenSpec} from "./types";
import {EditorView} from "@codemirror/view";

export default class ControlCharacterPlugin extends Plugin {
	settings: ControlCharacterSettings;

	async onload() {
		//eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!(this.app.vault as any).getConfig("legacyEditor")) {
			await this.loadSettings();

			this.registerEditorExtension(Prec.lowest(normalDecoration(this)));
			this.registerEditorExtension(Prec.lowest(selectionDecorations(this)));

			this.addSettingTab(new ControlCharactersSettingsTab(this));


			this.addCommand({
				id: "toggle",
				name: "Show/hide control characters",
				callback: async () => {
					this.settings.enabled = !this.settings.enabled;
					console.log(this.settings.enabled);
					await this.saveSettings();

					this.app.workspace.updateOptions();
				}
			});

			this.app.workspace.trigger('parse-style-settings');


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

	public getTokens(view: EditorView, from: number, to: number, settings: ControlCharacterSettings) : TokenSpec[] {
		const targetElements: TokenSpec[] = [];
		const text = view.state.sliceDoc(from, to);
		for (const match of text.matchAll(/[\u00A0\u202F\u2007\u2060\s]/gu)) {
			const index = from + match.index;
			if (match.toString() === "\n" && settings.newLine) {
				targetElements.push({from: index - 1, to: index, value: ControlCharacter.NEWLINE});
				continue;
			}
			let value: ControlCharacter;
			if (match.toString() === "\t" && settings.tab) {
				value = ControlCharacter.TAB;
			} else if (match.toString() === " " && settings.space) {
				value = ControlCharacter.SPACE;
			}else {
				value = ControlCharacter.OTHER;
			}
			targetElements.push({from: index, to: index + 1, value: value});
		}
		return targetElements;
	}
}
