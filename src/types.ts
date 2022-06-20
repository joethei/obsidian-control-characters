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
}
