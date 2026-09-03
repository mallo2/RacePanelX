import {CarTelemetry} from "@/models/telemetry/carTelemetry";
import {buildDisplayText, getAdditionalDisplayModes} from "@/utils/displayTextBuilder";
import {DisplayStyle} from "@/models/settings/displayStyle";
import jtImageGenerator from "@/services/jtImageGenerator";
import {createJTFile} from "./jt-generetor";
import {SettingsState} from "@/models/settings/state";
import {LapDisplayMode} from "@/models/settings/lapDisplayMode";
import {PNG} from "pngjs";
import {renderJTFile} from "./jt-renderer";
import fs from "node:fs";

const telemetryCases: Record<string, CarTelemetry> = {
    normal: {
        position: 10,
        bestLapTime: 128831,
        lastLapTime: 134914,
        deltaToLeader: {
            carNumber: "102",
            ms: 78217,
            laps: 0,
        },
        gapAhead: {
            carNumber: "160",
            ms: 8145,
            laps: 0,
        },
        gapBehind: {
            carNumber: "121",
            ms: 10094,
            laps: 0,
        },
    },

    minValues: {
        position: 1,
        bestLapTime: 0,
        lastLapTime: 0,
        deltaToLeader: {
            carNumber: "1",
            ms: 0,
            laps: 0,
        },
        gapAhead: {
            carNumber: "1",
            ms: 0,
            laps: 0,
        },
        gapBehind: {
            carNumber: "1",
            ms: 0,
            laps: 0,
        },
    },

    maxValues: {
        position: 99,
        bestLapTime: 999999,
        lastLapTime: 999999,
        deltaToLeader: {
            carNumber: "999",
            ms: 999999,
            laps: 99,
        },
        gapAhead: {
            carNumber: "999",
            ms: 999999,
            laps: 99,
        },
        gapBehind: {
            carNumber: "999",
            ms: 999999,
            laps: 99,
        },
    },

    oneDigitCars: {
        position: 1,
        bestLapTime: 999,
        lastLapTime: 1000,
        deltaToLeader: {
            carNumber: "1",
            ms: 1,
            laps: 1,
        },
        gapAhead: {
            carNumber: "2",
            ms: 1,
            laps: 1,
        },
        gapBehind: {
            carNumber: "3",
            ms: 1,
            laps: 1,
        },
    },

    twoDigitCars: {
        position: 50,
        bestLapTime: 60000,
        lastLapTime: 59999,
        deltaToLeader: {
            carNumber: "10",
            ms: 9999,
            laps: 10,
        },
        gapAhead: {
            carNumber: "99",
            ms: 99999,
            laps: 10,
        },
        gapBehind: {
            carNumber: "11",
            ms: 10000,
            laps: 10,
        },
    },

    threeDigitCars: {
        position: 99,
        bestLapTime: 128831,
        lastLapTime: 134914,
        deltaToLeader: {
            carNumber: "999",
            ms: 78217,
            laps: 99,
        },
        gapAhead: {
            carNumber: "888",
            ms: 8145,
            laps: 99,
        },
        gapBehind: {
            carNumber: "777",
            ms: 10094,
            laps: 99,
        },
    },
};

function detectHorizontalOverflow(
    pngPath: string,
    safetyMargin = 0,
) {
    const pngBuffer = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngBuffer);

    let firstX = png.width;
    let lastX = -1;

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const index = (y * png.width + x) * 4;

            const r = png.data[index];
            const g = png.data[index + 1];
            const b = png.data[index + 2];
            const a = png.data[index + 3];

            if (a > 0 && (r > 0 || g > 0 || b > 0)) {
                firstX = Math.min(firstX, x);
                lastX = Math.max(lastX, x);
            }
        }
    }

    return {
        width: png.width,
        contentWidth: lastX >= 0
            ? lastX - firstX + 1
            : 0,

        firstX,
        lastX,

        overflowLeft:
            firstX <= safetyMargin,

        overflowRight:
            lastX >= png.width - 1 - safetyMargin,
    };
}

function detectTooMuchEmptySpace(
    pngPath: string,
    minUsagePercent = 60,
    minContentWidth = 0,
) {
    const pngBuffer = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngBuffer);

    let firstX = png.width;
    let lastX = -1;

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const index = (y * png.width + x) * 4;

            const r = png.data[index];
            const g = png.data[index + 1];
            const b = png.data[index + 2];
            const a = png.data[index + 3];

            if (a > 0 && (r > 0 || g > 0 || b > 0)) {
                firstX = Math.min(firstX, x);
                lastX = Math.max(lastX, x);
            }
        }
    }

    // Aucun pixel affiché
    if (lastX === -1) {
        return {
            width: png.width,
            contentWidth: 0,
            usagePercent: 0,
            emptyPercent: 100,
            leftEmpty: png.width,
            rightEmpty: png.width,
            tooMuchEmptySpace: true,
        };
    }

    const contentWidth = lastX - firstX + 1;

    const leftEmpty = firstX;
    const rightEmpty = png.width - 1 - lastX;

    const usagePercent =
        (contentWidth / png.width) * 100;

    const emptyPercent =
        100 - usagePercent;

    const tooMuchEmptySpace =
        usagePercent < minUsagePercent ||
        contentWidth < minContentWidth;

    return {
        width: png.width,
        contentWidth,

        usagePercent: Number(usagePercent.toFixed(2)),
        emptyPercent: Number(emptyPercent.toFixed(2)),

        firstX,
        lastX,

        leftEmpty,
        rightEmpty,

        tooMuchEmptySpace,
    };
}

const lapDisplayModes = [
    LapDisplayMode.best,
    LapDisplayMode.last,
    LapDisplayMode.delta,
    LapDisplayMode.front,
    LapDisplayMode.back,
];

const displayStyles = [
    DisplayStyle.static,
    DisplayStyle.slide,
];

const largeTextValues = [true, false];

const manualDisplayValues = [true, false];

const displayTexts = [
    "",
    "T",
    "TEST",
    "12345678",
    "ABCDEFGH",
    "123456789",
    "ABCDEFGHIJKLM",
    "1234567890123",
];

const bugs: Array<{
    index: number;
    text: string;
    telemetryCase: string;
    settings: SettingsState;
    overflow: ReturnType<typeof detectHorizontalOverflow>;
}> = [];

let testIndex = 0;

for (const [telemetryName, telemetryData] of Object.entries(
    telemetryCases,
)) {
    for (const lapDisplayMode of lapDisplayModes) {
        const validAdditionalDisplayModes =
            getAdditionalDisplayModes(lapDisplayMode);

        for (const additionalDisplayMode of validAdditionalDisplayModes) {
            for (const displayStyle of displayStyles) {
                for (const largeText of largeTextValues) {
                    for (const manualDisplay of manualDisplayValues) {
                        for (const displayText of displayTexts) {
                            for (const carNumber in ["1", "11", "111"]) {
                                const settings: SettingsState = {
                                    apiUrl: "",
                                    updateInterval: 3,
                                    uuid: "",

                                    carNumber: carNumber,

                                    manualDisplay,
                                    displayText,

                                    displayStyle,
                                    largeText,

                                    lapDisplayMode,
                                    additionalDisplayMode,
                                };

                                const currentText =
                                    buildDisplayText(
                                        telemetryData,
                                        settings,
                                    );

                                const imageData =
                                    jtImageGenerator.generateJTImage(
                                        currentText,
                                        largeText
                                            ? "large"
                                            : "small",
                                        "cyan",
                                    );

                                const jt_file = createJTFile(imageData);

                                const png_file =  renderJTFile(jt_file);

                                const overflow =
                                    detectHorizontalOverflow(
                                        png_file,
                                        1,
                                    );

                                const underflow = detectTooMuchEmptySpace(
                                    png_file,
                                    60,
                                );

                                if ((underflow.tooMuchEmptySpace && !manualDisplay) ||
                                    (overflow.overflowLeft ||
                                    overflow.overflowRight) &&
                                    displayStyle != DisplayStyle.slide
                                ) {
                                    bugs.push({
                                        index: testIndex,
                                        text: currentText,
                                        telemetryCase: telemetryName,
                                        settings,
                                        overflow,
                                    });

                                    console.error(
                                        "🚨 DISPLAY BUG",
                                        {
                                            index: testIndex,
                                            telemetryName,
                                            currentText,
                                            largeText,
                                            lapDisplayMode,
                                            additionalDisplayMode,
                                            displayStyle,
                                            overflow,
                                            underflow,
                                        },
                                    );
                                } else {
                                    fs.unlinkSync(png_file);
                                    fs.unlinkSync(jt_file);
                                }

                                testIndex++;
                            }
                        }
                    }
                }
            }
        }
    }
}

console.log(
    `Tests: ${testIndex}`,
);

console.log(
    `🚨 Problèmes détectés: ${bugs.length}`,
);
