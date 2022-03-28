import {WidgetType} from "@codemirror/view";

export class SymbolWidget extends WidgetType {

	text: string;

	constructor(text: string) {
		super();
		this.text = text;
	}

	eq(other: SymbolWidget) {
		return other == this;
	}

	toDOM() {
		const span = document.createElement("span");
		span.textContent = this.text;
		span.addClass("control-character");
		return span;
	}

	ignoreEvent(): boolean {
		return false;
	}
}
