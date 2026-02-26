export enum ControlCharacter {
	NEWLINE = "newline",
	SPACE = "space",
	TAB = "tab",
	OTHER = "other",
}

export interface TokenSpec {
	from: number;
	to: number;
	value: ControlCharacter;
	charCode?: string;    // e.g. "U+200B" — only set for OTHER tokens
	both?: boolean;       // true = show U+XXXX label alongside the highlight
}
