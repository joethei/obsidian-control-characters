import {Decoration, DecorationSet, EditorView, WidgetType} from "@codemirror/view";
import {Range} from "@codemirror/state";
import {debounce} from "obsidian";
import {statefulDecorations} from "./StatefulDecoration";
import {TokenSpec} from "./types";

// These chars have Grapheme_Cluster_Break = Extend or ZWJ, so the cursor
// cannot be placed between them and the preceding character.
const STICKY_CHARS = new Set(['U+200C', 'U+200D', 'U+FE0E', 'U+FE0F']);

class CharHighlightWidget extends WidgetType {
	constructor(readonly charCode: string) { super(); }

	eq(other: CharHighlightWidget): boolean {
		return other.charCode === this.charCode;
	}

	toDOM(): HTMLElement {
		const span = document.createElement("span");
		span.className = "control-character";
		span.setAttribute("type", "other-highlight");
		if (STICKY_CHARS.has(this.charCode)) span.classList.add("control-character--sticky");
		// Render the actual character so the span inherits its natural width;
		// CSS min-width ensures zero-width chars remain visible.
		const codePoint = parseInt(this.charCode.slice(2), 16);
		span.textContent = String.fromCodePoint(codePoint);
		return span;
	}

	ignoreEvent(): boolean { return false; }
}

class CharBothWidget extends WidgetType {
	constructor(readonly charCode: string) { super(); }

	eq(other: CharBothWidget): boolean {
		return other.charCode === this.charCode;
	}

	toDOM(): HTMLElement {
		const outer = document.createElement("span");
		outer.className = "control-character";
		outer.setAttribute("type", "other-both");
		if (STICKY_CHARS.has(this.charCode)) outer.classList.add("control-character--sticky");

		// Highlight part — shows the character's natural width with a colored background.
		const spacePart = document.createElement("span");
		spacePart.className = "cc-highlight-part";
		const codePoint = parseInt(this.charCode.slice(2), 16);
		spacePart.textContent = String.fromCodePoint(codePoint);

		// Badge part — shows the U+XXXX label.
		const labelPart = document.createElement("span");
		labelPart.className = "cc-label-part";
		labelPart.textContent = this.charCode;

		outer.appendChild(spacePart);
		outer.appendChild(labelPart);
		return outer;
	}

	ignoreEvent(): boolean { return false; }
}

export class StatefulDecorationSet {
	editor: EditorView;
	decoCache: { [cls: string]: Decoration } = Object.create(null);

	constructor(editor: EditorView) {
		this.editor = editor;
	}

	async computeAsyncDecorations(tokens: TokenSpec[]): Promise<DecorationSet | null> {
		const decorations: Range<Decoration>[] = [];
		for (const token of tokens) {
			const cacheKey = token.charCode
				? `${token.value}:${token.charCode}:${token.both ? 'bh' : 'h'}`
				: token.value;
			let deco = this.decoCache[cacheKey];
			if (!deco) {
				if (token.charCode) {
					const widget = token.both
						? new CharBothWidget(token.charCode)
						: new CharHighlightWidget(token.charCode);
					deco = this.decoCache[cacheKey] = Decoration.replace({ widget });
				} else {
					deco = this.decoCache[cacheKey] = Decoration.mark({
						class: "control-character",
						attributes: {type: token.value}
					});
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
			this.editor.dispatch({effects: statefulDecorations.update.of(decorations || Decoration.none)});
		}
	}
}
