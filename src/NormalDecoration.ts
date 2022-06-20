import {EditorView, DecorationSet, ViewUpdate, ViewPlugin} from "@codemirror/view";
import ControlCharacterPlugin from "./main";
import {statefulDecorations} from "./StatefulDecoration";
import {StateField} from "@codemirror/state";
import {StatefulDecorationSet} from "./StatefulDecorationSet";
import {TokenSpec} from "./types";
import {parseFrontmatter} from "./FrontmatterParser";
import {ControlCharacterSettings} from "./settings";

/*
using a custom Decoration here because a MatchDecoration only seems to allow replacing decorations, nothing else.
 */
function buildViewPlugin(plugin: ControlCharacterPlugin) {
	return ViewPlugin.fromClass(
		class {
			decoManager: StatefulDecorationSet;

			constructor(view: EditorView) {
				this.decoManager = new StatefulDecorationSet(view);
				this.buildAsyncDecorations(view, plugin.settings);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					const frontmatter = parseFrontmatter(update.view, plugin.settings);
					if (!frontmatter.enabled || frontmatter.selection) {
						this.decoManager.debouncedUpdate([]);
						return;
					}
					this.buildAsyncDecorations(update.view, frontmatter);
				}
			}

			buildAsyncDecorations(view: EditorView, settings: ControlCharacterSettings) {
				const targetElements: TokenSpec[] = [];
				for (const {from, to} of view.visibleRanges) {
					targetElements.push(...plugin.getTokens(view, from, to, settings));
				}
				this.decoManager.debouncedUpdate(targetElements);
			}
		}
	);

}

export function normalDecoration(plugin: ControlCharacterPlugin): (StateField<DecorationSet> | ViewPlugin<{ decoManager: StatefulDecorationSet; update(update: ViewUpdate): void; destroy(): void; buildAsyncDecorations(view: EditorView): void }>)[] {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
