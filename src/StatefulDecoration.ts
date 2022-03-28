import {StateEffect, StateEffectType, StateField} from "@codemirror/state";
import {Decoration, DecorationSet, EditorView} from "@codemirror/view";

export const statefulDecorations = defineStatefulDecoration();

// Generic helper for creating pairs of editor state fields and
// effects to model imperatively updated decorations.
// source: https://github.com/ChromeDevTools/devtools-frontend/blob/8f098d33cda3dd94b53e9506cd3883d0dccc339e/front_end/panels/sources/DebuggerPlugin.ts#L1722
function defineStatefulDecoration(): {
	update: StateEffectType<DecorationSet>;
	field: StateField<DecorationSet>;
} {
	const update = StateEffect.define<DecorationSet>();
	const field = StateField.define<DecorationSet>({
		create(): DecorationSet {
			return Decoration.none;
		},
		update(deco, tr): DecorationSet {
			return tr.effects.reduce((deco, effect) => (effect.is(update) ? effect.value : deco), deco.map(tr.changes));
		},
		provide: field => EditorView.decorations.from(field),
	});
	return { update, field };
}

