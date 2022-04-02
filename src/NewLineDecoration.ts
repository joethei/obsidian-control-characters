import { debounce } from "obsidian";
import { EditorView, Decoration, DecorationSet, ViewUpdate, ViewPlugin } from "@codemirror/view";
import { Range } from "@codemirror/rangeset";
import {SymbolWidget} from "./SymbolWidget";
import ControlCharacterPlugin, {staticConfig} from "./main";
import {statefulDecorations} from "./StatefulDecoration";
import {StateField} from "@codemirror/state";

/*
using a custom decoration here because a MatchDecoration only seems to allow replacing decorations, not widget ones.
 */

interface TokenSpec {
	from: number;
	to: number;
}

class StatefulDecorationSet {
	editor: EditorView;
	decoCache: Decoration;

	constructor(editor: EditorView) {
		this.editor = editor;
	}

	async computeAsyncDecorations(tokens: TokenSpec[]): Promise<DecorationSet | null> {
		const decorations: Range<Decoration>[] = [];
		for (const token of tokens) {
			let deco = this.decoCache;
			if (!deco) {
				deco = this.decoCache = Decoration.widget({ widget: new SymbolWidget("↵") });
			}
			decorations.push(deco.range(token.from, token.from));
		}
		return Decoration.set(decorations, true);
	}

	debouncedUpdate = debounce(this.updateAsyncDecorations, 10, true);

	async updateAsyncDecorations(tokens: TokenSpec[]): Promise<void> {
		const decorations = await this.computeAsyncDecorations(tokens);
		// if our compute function returned nothing and the state field still has decorations, clear them out
		if (decorations || this.editor.state.field(statefulDecorations.field).size) {
			this.editor.dispatch({ effects: statefulDecorations.update.of(decorations || Decoration.none) });
		}
	}
}

function buildViewPlugin(plugin: ControlCharacterPlugin) {
	return ViewPlugin.fromClass(
		class {
			decoManager: StatefulDecorationSet;

			constructor(view: EditorView) {
				this.decoManager = new StatefulDecorationSet(view);
				this.buildAsyncDecorations(view);
			}

			update(update: ViewUpdate) {
				const reconfigured = update.startState.facet(staticConfig) !== update.state.facet(staticConfig);
				if (update.docChanged || update.viewportChanged || reconfigured) {
					this.buildAsyncDecorations(update.view);
				}
			}

			buildAsyncDecorations(view: EditorView) {
				if(!plugin.settings.enabled || !plugin.settings.newLine) {
					this.decoManager.debouncedUpdate([]);
					return;
				}
				const targetElements: TokenSpec[] = [];

				for (const {from, to} of view.visibleRanges) {
					const text = view.state.sliceDoc(from, to);
					for (const match of text.matchAll(/\n$|[\s\S]$/gm)) {
						const index = from + match.index + 1;
						targetElements.push({from: index, to: index});
					}
				}
				this.decoManager.debouncedUpdate(targetElements);
			}
		}
	);

}

export function newLineDecoration(plugin: ControlCharacterPlugin): (StateField<DecorationSet> | ViewPlugin<{ decoManager: StatefulDecorationSet; update(update: ViewUpdate): void; destroy(): void; buildAsyncDecorations(view: EditorView): void }>)[] {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
