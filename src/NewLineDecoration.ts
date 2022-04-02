import { debounce } from "obsidian";
import { EditorView, Decoration, DecorationSet, ViewUpdate, ViewPlugin } from "@codemirror/view";
import { Range } from "@codemirror/rangeset";
import {SymbolWidget} from "./SymbolWidget";
import ControlCharacterPlugin from "./main";
import {statefulDecorations} from "./StatefulDecoration";
import {StateField} from "@codemirror/state";

/*
using a custom decoration here because a MatchDecoration only seems to allow replacing decorations, not widget ones.
 */

interface TokenSpec {
	from: number;
	to: number;
	value: string;
}

class StatefulDecorationSet {
	editor: EditorView;
	decoCache: {[cls: string]: Decoration} = Object.create(null);

	constructor(editor: EditorView) {
		this.editor = editor;
	}

	async computeAsyncDecorations(tokens: TokenSpec[]): Promise<DecorationSet | null> {
		const decorations: Range<Decoration>[] = [];
		for (const token of tokens) {
			let deco = this.decoCache[token.value];
			if (!deco) {
				if(token.value === "↵") {
					deco = this.decoCache[token.value] = Decoration.widget({ widget: new SymbolWidget(token.value) });
				}else {
					deco = this.decoCache[token.value] = Decoration.replace({ widget: new SymbolWidget(token.value) });
				}
			}
			decorations.push(deco.range(token.from, token.to));
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
				if (update.docChanged || update.viewportChanged) {
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
					for (const match of text.matchAll(/\s/g)) {
						const index = from + match.index;
						if(match.toString() === "\n") {
							targetElements.push({from: index + 1, to: index + 1, value: "↵"});
							continue;
						}
						let value = " ";
						if (match.toString() === "\t" && plugin.settings.tab) {
							value = "⇨";
						} else if (plugin.settings.space) {
							value = "◦";
						}
						targetElements.push({from: index, to: index + 1, value: value});
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
