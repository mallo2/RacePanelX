import fs from "node:fs";
import path from "node:path";
import { JT_FONTS } from "@/services/fonts/jtFonts";
import { renderFont } from "./renderFont";
import { renderGlyph } from "./renderGlyph";
import { getCharFileName } from "./charFileName";

const OUTPUT_DIR = path.resolve(process.cwd(), "generated-jt", "fonts");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const size of Object.keys(JT_FONTS) as Array<keyof typeof JT_FONTS>) {
    const font = JT_FONTS[size];

    const atlasBuffer = renderFont(font);
    const atlasPath = path.join(OUTPUT_DIR, `${size}.png`);
    fs.writeFileSync(atlasPath, atlasBuffer);
    console.log(`🔤 "${size}" (atlas) :`, atlasPath);

    const glyphsDir = path.join(OUTPUT_DIR, size);
    fs.mkdirSync(glyphsDir, { recursive: true });

    for (const char of Object.keys(font.glyphs)) {
        const glyphBuffer = renderGlyph(font, char);
        const glyphPath = path.join(glyphsDir, `${getCharFileName(char)}.png`);
        fs.writeFileSync(glyphPath, glyphBuffer);
    }

    console.log(`🔤 "${size}" (glyphs) :`, glyphsDir);
}