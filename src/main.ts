import {editorLivePreviewField, MarkdownEditView, MarkdownView, Plugin} from 'obsidian';
import {Extension, Prec} from "@codemirror/state";
import {ControlCharactersSettingsTab} from "./SettingsTab";
import {normalDecoration} from "./NormalDecoration";
import {forceUpdate} from "./StatefulDecoration";
import {ControlCharacterSettings, DEFAULT_SETTINGS} from "./settings";
import {selectionDecorations} from "./SelectionHighlight";
import {ControlCharacter, TokenSpec} from "./types";
import {EditorView} from "@codemirror/view";
import {parseFrontmatter} from "./FrontmatterParser";

// eslint-disable-next-line no-misleading-character-class -- intentionally matches individual combining/ZWJ chars as invisible characters
const INVISIBLE_CHARS_REGEX = /[\s\u00A0\u00AD\u034F\u1160\u1680\u180E\u2000-\u200F\u2028\u2029\u202A-\u202F\u2060-\u2064\u205F\u2800\u3000\u3164\uFE00-\uFE0F\uFEFF]/gu;

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
		this.app.workspace.iterateAllLeaves(leaf => {
			if (!(leaf.view instanceof MarkdownView)) return;
			// @ts-ignore - internal Obsidian API
			const cm: EditorView = leaf.view.editor?.cm;
			if (cm instanceof EditorView) {
				cm.dispatch({effects: forceUpdate.of(null)});
			}
		});
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

		for (const match of text.matchAll(INVISIBLE_CHARS_REGEX)) {
			const char = match[0];
			const index = from + (match.index ?? 0);

			if (char === "\n" || char === "\r") {
				if (settings.newLine && char === "\n") {
					targetElements.push({from: index - 1, to: index, value: ControlCharacter.NEWLINE});
				}
				continue;
			}
			if (char === "\t") {
				if (settings.tab) {
					targetElements.push({from: index, to: index + 1, value: ControlCharacter.TAB});
				}
				continue;
			}
			if (char === " ") {
				if (settings.space) {
					targetElements.push({from: index, to: index + 1, value: ControlCharacter.SPACE});
				}
				continue;
			}
			if (settings.other) {
				const codePoint = char.codePointAt(0) ?? 0;
				const charCode = "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0");
				targetElements.push({from: index, to: index + 1, value: ControlCharacter.OTHER, charCode, both: settings.otherLabels});
			}
		}
		return targetElements;
	}
}
