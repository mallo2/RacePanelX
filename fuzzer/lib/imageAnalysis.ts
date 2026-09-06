export function analyzeImageData(
    imageData: Uint8Array | number[],
    safetyMargin = 0,
    minUsagePercent = 60,
    minContentWidth = 0,
    width: number = 96,
    height: number = 16,
) {
    const pages = Math.ceil(height / 8);
    const planeSize = width * pages;
    const planeCount = Math.max(1, Math.floor(imageData.length / planeSize));

    const isPixelOn = (x: number, y: number): boolean => {
        const page = Math.floor(y / 8);
        const bitRow = y % 8;
        const bit = 7 - bitRow;

        for (let plane = 0; plane < planeCount; plane++) {
            const byteIndex = plane * planeSize + x * pages + page;
            const byte = imageData[byteIndex] ?? 0;
            if (((byte >> bit) & 1) === 1) {
                return true;
            }
        }

        return false;
    };

    let firstX = width;
    let lastX = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isPixelOn(x, y)) {
                firstX = Math.min(firstX, x);
                lastX = Math.max(lastX, x);
            }
        }
    }

    if (lastX === -1) {
        return {
            width,
            contentWidth: 0,
            firstX: width,
            lastX: -1,
            usagePercent: 0,
            emptyPercent: 100,
            leftEmpty: width,
            rightEmpty: width,
            overflowLeft: true,
            overflowRight: true,
            tooMuchEmptySpace: true,
        };
    }

    const contentWidth = lastX - firstX + 1;
    const leftEmpty = firstX;
    const rightEmpty = width - 1 - lastX;

    const usagePercent = (contentWidth / width) * 100;
    const emptyPercent = 100 - usagePercent;

    return {
        width,
        contentWidth,
        firstX,
        lastX,
        usagePercent: Number(usagePercent.toFixed(2)),
        emptyPercent: Number(emptyPercent.toFixed(2)),
        leftEmpty,
        rightEmpty,

        overflowLeft: firstX <= safetyMargin,
        overflowRight: lastX >= width - 1 - safetyMargin,

        tooMuchEmptySpace:
            usagePercent < minUsagePercent ||
            contentWidth < minContentWidth,
    };
}

export type ImageAnalysis = ReturnType<typeof analyzeImageData>;