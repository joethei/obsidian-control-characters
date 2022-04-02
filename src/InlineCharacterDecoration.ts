import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewUpdate,
	ViewPlugin,
	MatchDecorator
} from "@codemirror/view";
import {SymbolWidget} from "./SymbolWidget";
import ControlCharacterPlugin, {staticConfig} from "./main";
import {statefulDecorations} from "./StatefulDecoration";
import {StateField} from "@codemirror/state";

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
						if (plugin.settings.enabled && match.toString() === "\t" && plugin.settings.tab) {
							value = "⇨";
						} else if(plugin.settings.enabled && plugin.settings.space) {
							value = "◦";
						}

						return Decoration.replace({widget: new SymbolWidget(value)});
					})
				})
			}

			update(update: ViewUpdate) {
				const reconfigured = update.startState.facet(staticConfig) !== update.state.facet(staticConfig);
				if (update.docChanged || update.viewportChanged || reconfigured) {
					this.decorations = this.decorator.updateDeco(update, this.decorations);
				}
			}

		},
		{
			decorations: (v) => v.decorations
		}
	);
}

export function inlineDecoration(plugin: ControlCharacterPlugin): (StateField<DecorationSet> | ViewPlugin<{ decorator: MatchDecorator; decorations: DecorationSet; view: EditorView; update(update: ViewUpdate): void }>)[] {
	return [statefulDecorations.field, buildViewPlugin(plugin)];
}
