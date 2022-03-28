import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewUpdate,
	ViewPlugin,
	MatchDecorator
} from "@codemirror/view";
import {SymbolWidget} from "./SymbolWidget";
import ControlCharacterPlugin from "./main";
import {statefulDecorations} from "./StatefulDecoration";

function buildViewPlugin(plugin: ControlCharacterPlugin) {
	return ViewPlugin.fromClass(
		class {
			decorator: MatchDecorator;
			decorations: DecorationSet = Decoration.none;

			constructor(public view: EditorView) {

				this.decorator = new MatchDecorator({
					regexp: /\s/g,
					decoration: (match => {
						let value = " ";
						if (match.toString() === "\t" && plugin.settings.tab) {
							value = "⇨";
						} else if(plugin.settings.space) {
							value = "◦";
						}

						return Decoration.replace({widget: new SymbolWidget(value)});
					})
				})
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.decorator.updateDeco(update, this.decorations);
				}
			}

			destroy() {
			}
		},
		{
			decorations: (v) => v.decorations
		}
	);
}

export function inlineCharacterDecoration(plugin: ControlCharacterPlugin) {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
