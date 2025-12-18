import {editorLivePreviewField, MarkdownEditView, MarkdownView, Plugin} from 'obsidian';
import {Extension, Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import {normalDecoration} from "./NormalDecoration";
import {ControlCharacterSettings, DEFAULT_SETTINGS} from "./settings";
import {selectionDecorations} from "./SelectionHighlight";
import {ControlCharacter, TokenSpec} from "./types";
import {EditorView} from "@codemirror/view";
import {parseFrontmatter} from "./FrontmatterParser";

export default class ControlCharacterPlugin extends Plugin {
	settings: ControlCharacterSettings;
	enabledExtensions: Extension[] = [];

	normalDecoration = Prec.lowest(normalDecoration(this));
	selectionDecoration = Prec.lowest(selectionDecorations(this));

	async onload() {
		await this.loadSettings();

		if(this.settings.enabled && !this.settings.selection) {
			this.enabledExtensions.push(this.normalDecoration);
		}
		if(this.settings.enabled && this.settings.selection) {
			this.enabledExtensions.push(this.selectionDecoration);
		}

		this.registerEditorExtension(this.enabledExtensions);
		this.addSettingTab(new ControlCharactersSettingsTab(this));


		this.addCommand({
			id: "toggle",
			name: "Show/hide control characters",
			callback: async () => {
				this.settings.enabled = !this.settings.enabled;
				await this.saveSettings();
			}
		});

		this.app.workspace.trigger('parse-style-settings');
	}

	onunload() {

	}

	updateDecorations() {
		while (this.enabledExtensions.length > 0) {
			this.enabledExtensions.pop();
		}
		if(this.settings.enabled && !this.settings.selection) {
			this.enabledExtensions.push(this.normalDecoration);
		}
		if(this.settings.enabled && this.settings.selection) {
			this.enabledExtensions.push(this.selectionDecoration);
		}
		this.app.workspace.updateOptions();
	}

	async onExternalSettingsChange() {
		await this.loadSettings();
		this.updateDecorations();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateDecorations();
	}

	public getTokens(view: EditorView, from: number, to: number, settings: ControlCharacterSettings): TokenSpec[] {
		const targetElements: TokenSpec[] = [];
		if(view.state.field(editorLivePreviewField) && !settings.livePreviewMode) {
			return targetElements;
		}
		if(!view.state.field(editorLivePreviewField) && !settings.sourceMode) {
			return targetElements;
		}

		const text = view.state.sliceDoc(from, to);
		for (const match of text.matchAll(/[\u00A0\u202F\u2007\u2060\s]/gu)) {
			const index = from + match.index;
			if (match.toString() === "\n") {
				if(settings.newLine) {
					targetElements.push({from: index - 1, to: index, value: ControlCharacter.NEWLINE});
					continue;
				}
			}
			let value: ControlCharacter;
			if (match.toString() === "\t") {
				if(settings.tab)
					value = ControlCharacter.TAB;
			} else if (match.toString() === " ") {
				if(settings.space)
					value = ControlCharacter.SPACE;
			} else {
				value = ControlCharacter.OTHER;
			}
			targetElements.push({from: index, to: index + 1, value: value});
		}
		return targetElements;
	}
}
