import { debounce } from "obsidian";
import { EditorView, Decoration, DecorationSet, ViewUpdate, ViewPlugin } from "@codemirror/view";
import { Range } from "@codemirror/rangeset";
import {SymbolWidget} from "./SymbolWidget";
import ControlCharacterPlugin from "./main";
import {statefulDecorations} from "./StatefulDecoration";

interface TokenSpec {
	from: number;
	to: number;
}

class StatefulDecorationSet {
	editor: EditorView;
	decoCache: { [cls: string]: Decoration } = Object.create(null);

	constructor(editor: EditorView) {
		this.editor = editor;
	}

	async computeAsyncDecorations(tokens: TokenSpec[]): Promise<DecorationSet | null> {
		const decorations: Range<Decoration>[] = [];
		for (let token of tokens) {
			let deco = this.decoCache[""];
			if (!deco) {
				deco = this.decoCache[""] = Decoration.widget({ widget: new SymbolWidget("↵") });
			}
			decorations.push(deco.range(token.from, token.from));
		}
		return Decoration.set(decorations, true);
	}

	debouncedUpdate = debounce(this.updateAsyncDecorations, 100, true);

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

			destroy() {
			}

			buildAsyncDecorations(view: EditorView) {
				if(!plugin.settings.newLine) {
					return;
				}

				const targetElements: TokenSpec[] = [];
				for (let {from, to} of view.visibleRanges) {
					const text = view.state.sliceDoc(from, to);
					for (let regExpMatchArray of text.matchAll(/\n$/gm)) {
						targetElements.push({from: regExpMatchArray.index, to: regExpMatchArray.index});
					}
				}
				this.decoManager.debouncedUpdate(targetElements);
			}
		}
	);

}

export function newLineDecoration(plugin: ControlCharacterPlugin) {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
