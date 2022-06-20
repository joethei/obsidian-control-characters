import {DecorationSet, EditorView, ViewPlugin, ViewUpdate} from "@codemirror/view";
import {StatefulDecorationSet} from "./StatefulDecorationSet";
import ControlCharacterPlugin from "./main";
import {StateField} from "@codemirror/state";
import {statefulDecorations} from "./StatefulDecoration";
import {parseFrontmatter} from "./FrontmatterParser";
import {TokenSpec} from "./types";
import {ControlCharacterSettings} from "./settings";

function buildViewPlugin(plugin: ControlCharacterPlugin) {

	return ViewPlugin.fromClass(
		class {
			decoManager: StatefulDecorationSet;

			constructor(view: EditorView) {
				this.decoManager = new StatefulDecorationSet(view);
				const frontmatter = parseFrontmatter(view, plugin.settings);
				if(!frontmatter.selection) {
					return;
				}
				this.buildAsyncDecorations(view, parseFrontmatter(view, plugin.settings));
			}

			update(update: ViewUpdate) {
				const frontmatter = parseFrontmatter(update.view, plugin.settings);
				if(!frontmatter.selection) {
					return;
				}

				if (update.selectionSet || update.docChanged || update.viewportChanged) {
					this.buildAsyncDecorations(update.view, frontmatter);
				}
			}

			buildAsyncDecorations(view: EditorView, settings: ControlCharacterSettings) {
				const targetElements: TokenSpec[] = [];
				for (let range of view.state.selection.ranges) {
					targetElements.push(...plugin.getTokens(view, range.from, range.to, settings));
				}
				this.decoManager.debouncedUpdate(targetElements);
			}


		},
	);
}

export function selectionDecorations(plugin: ControlCharacterPlugin): (StateField<DecorationSet> | ViewPlugin<{ decoManager: StatefulDecorationSet; update(update: ViewUpdate): void; destroy(): void; buildAsyncDecorations(view: EditorView): void }>)[] {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
