const CHAR_FILE_NAMES: Record<string, string> = {
    " ": "space",
    ":": "colon",
    ",": "comma",
    "#": "hash",
    "?": "question",
    "!": "exclamation",
    "+": "plus",
    "-": "minus",
};

export function getCharFileName(char: string): string {
    return CHAR_FILE_NAMES[char] ?? char;
}