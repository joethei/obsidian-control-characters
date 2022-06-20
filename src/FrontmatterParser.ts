import {parseYaml} from "obsidian";
import {EditorView} from "@codemirror/view";
import {ControlCharacterSettings} from "./settings";

export function parseFrontmatter(view: EditorView, settings: ControlCharacterSettings) : ControlCharacterSettings {
	const result: ControlCharacterSettings = {
		enabled: settings.enabled,
		newLine: settings.newLine,
		selection: settings.selection,
		space: settings.space,
		tab: settings.tab,
	};
	const matches = view.state.sliceDoc().match(/---([\s\S]*?)---/);
	if(matches && matches.length !== 0) {
		for (let match of matches) {
			const replaced = match.replace(/---/g, "");
			try {
				const frontmatter = parseYaml(replaced);
				if(frontmatter.hasOwnProperty("cc")) {
					result.enabled = frontmatter.cc;
				}
				if(frontmatter.hasOwnProperty("cc-tab")) {
					result.tab = frontmatter['cc-tab'];
				}
				if(frontmatter.hasOwnProperty("cc-newline")) {
					result.newLine = frontmatter['cc-newline'];
				}
				if(frontmatter.hasOwnProperty("cc-space")) {
					result.space = frontmatter['cc-space'];
				}
				if(frontmatter.hasOwnProperty("cc-selection")) {
					result.selection = frontmatter['cc-selection'];
				}
			}catch (e) {
				//swallow error and use plugin settings.
			}
		}
	}
	return result;
}
