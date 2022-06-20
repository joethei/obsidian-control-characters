import {Decoration, DecorationSet, EditorView} from "@codemirror/view";
import {Range} from "@codemirror/state";
import {debounce} from "obsidian";
import {statefulDecorations} from "./StatefulDecoration";
import {TokenSpec} from "./types";

export class StatefulDecorationSet {
	editor: EditorView;
	decoCache: { [cls: string]: Decoration } = Object.create(null);

	constructor(editor: EditorView) {
		this.editor = editor;
	}

	async computeAsyncDecorations(tokens: TokenSpec[]): Promise<DecorationSet | null> {
		const decorations: Range<Decoration>[] = [];
		for (const token of tokens) {
			let deco = this.decoCache[token.value];
			if (!deco) {
				deco = this.decoCache[token.value] = Decoration.mark({
					class: "control-character",
					attributes: {type: token.value}
				});
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
			this.editor.dispatch({effects: statefulDecorations.update.of(decorations || Decoration.none)});
		}
	}
}
