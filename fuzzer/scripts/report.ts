import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { collectBugsWithImages, BugWithImage } from "../lib/collectBugsWithImages";
import { renderGraffitiDataToPngBuffer } from "../../tools/jt-preview/jtRenderer";
import { PANEL_CONFIG } from "@/config/config";
import { LapDisplayMode } from "@/models/settings/lapDisplayMode";
import { DisplayStyle } from "@/models/settings/displayStyle";
import { AdditionalDisplayMode } from "@/models/settings/additionalDisplayMode";

const OUTPUT_DIR = path.resolve(process.cwd(), "generated-jt", "report");
const IMAGES_DIR = path.join(OUTPUT_DIR, "images");

interface BugGroup {
    hash: string;
    imageData: number[];
    pngFileName: string;
    bugs: BugWithImage[];
}

/**
 * Two bugs that produce the EXACT same render (same bytes) are grouped
 * together: no point generating the same image 40 times when a single
 * broken `displayText` repeats across 40 settings combinations.
 */
function hashImageData(imageData: number[]): string {
    return crypto
        .createHash("sha1")
        .update(Buffer.from(imageData))
        .digest("hex")
        .slice(0, 12);
}

function groupBugsByImage(bugs: BugWithImage[]): BugGroup[] {
    const groups = new Map<string, BugGroup>();

    for (const bug of bugs) {
        const hash = hashImageData(bug.imageData);
        const existing = groups.get(hash);

        if (existing) {
            existing.bugs.push(bug);
        } else {
            groups.set(hash, {
                hash,
                imageData: bug.imageData,
                pngFileName: `${hash}.png`,
                bugs: [bug],
            });
        }
    }

    // Groups affecting the most cases first: these are the most
    // cost-effective to fix (one fix resolves the most listed bugs).
    return [...groups.values()].sort((a, b) => b.bugs.length - a.bugs.length);
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', "&amp;")
        .replaceAll('<', "&lt;")
        .replaceAll('>', "&gt;")
        .replaceAll('"', "&quot;");
}

function renderGroupSection(group: BugGroup, groupIndex: number): string {
    const {details} = group.bugs[0]; // identical for the whole group: same image, same thresholds

    const rows = group.bugs
        .map((bug) => `
            <tr>
                <td>${bug.index}</td>
                <td>${escapeHtml(bug.telemetryCase)}</td>
                <td><code>${escapeHtml(bug.text)}</code></td>
                <td>${DisplayStyle[bug.settings.displayStyle]}</td>
                <td>${LapDisplayMode[bug.settings.lapDisplayMode]}</td>
                <td>${AdditionalDisplayMode[bug.settings.additionalDisplayMode]}</td>
                <td>${bug.settings.largeText ? "yes" : "no"}</td>
                <td>${bug.settings.manualDisplay ? "yes" : "no"}</td>
            </tr>
        `)
        .join("");

    return `
        <section class="group">
            <h2>Render #${groupIndex + 1} — ${group.bugs.length} matching case${group.bugs.length > 1 ? "s" : ""}</h2>
            <img src="images/${group.pngFileName}" alt="Buggy render #${groupIndex + 1}" class="preview">
            <p class="details">
                usage: <strong>${details.usagePercent}%</strong> ·
                overflowLeft: <strong>${details.overflowLeft}</strong> ·
                overflowRight: <strong>${details.overflowRight}</strong> ·
                tooMuchEmptySpace: <strong>${details.tooMuchEmptySpace}</strong>
            </p>
            <table>
                <thead>
                    <tr>
                        <th>#</th><th>Telemetry case</th><th>Text</th><th>Style</th>
                        <th>Lap mode</th><th>Additional mode</th><th>Large text</th><th>Manual</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </section>
    `;
}

function renderHtml(groups: BugGroup[], testCount: number, totalBugs: number): string {
    const sections = groups.map((group, index) => renderGroupSection(group, index)).join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Display fuzzer report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; background: #fafafa; }
        h1 { margin-bottom: 0.25rem; }
        .summary { color: #555; margin-bottom: 2rem; }
        .group { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
        .group h2 { margin-top: 0; font-size: 1.1rem; }
        .preview { image-rendering: pixelated; border: 1px solid #ccc; background: black; display: block; margin: 0.75rem 0; }
        .details { color: #444; font-size: 0.9rem; }
        table { border-collapse: collapse; width: 100%; margin-top: 0.75rem; font-size: 0.85rem; }
        th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #eee; }
        th { color: #666; font-weight: 600; }
        code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🚨 Display fuzzer report</h1>
    <p class="summary">
        ${testCount} cases tested · ${totalBugs} bugs · ${groups.length} distinct render${groups.length > 1 ? "s" : ""}
    </p>
    ${sections}
</body>
</html>`;
}

function main(): void {
    const {testCount, bugs} = collectBugsWithImages();

    if (bugs.length === 0) {
        console.log(`Tests: ${testCount}`);
        console.log("✅ No bugs found, nothing to report.");
        return;
    }

    const groups = groupBugsByImage(bugs);

    fs.mkdirSync(IMAGES_DIR, {recursive: true});

    for (const group of groups) {
        const pngBuffer = renderGraffitiDataToPngBuffer(
            group.imageData,
            PANEL_CONFIG.WIDTH,
            PANEL_CONFIG.HEIGHT,
        );
        fs.writeFileSync(path.join(IMAGES_DIR, group.pngFileName), pngBuffer);
    }

    const html = renderHtml(groups, testCount, bugs.length);
    const indexPath = path.join(OUTPUT_DIR, "index.html");
    fs.writeFileSync(indexPath, html, "utf8");

    console.log(`Tests: ${testCount}`);
    console.log(`🚨 Bugs: ${bugs.length} (${groups.length} distinct renders)`);
    console.log(`📄 Report: ${indexPath}`);
}

main();