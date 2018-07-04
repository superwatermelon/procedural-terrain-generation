export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Returns the permutations of the items in the array
 * @param arr the array of items
 * @returns {array} the array of permutations
 */
export function permutations(arr) {

    const recurse = (acc, arr) => {
        if (arr.length === 0) {
            return [acc];
        } else {
            return arr.reduce((r, v, i) =>
                r.concat(recurse(acc.concat([v]), arr.slice(0, i).concat(arr.slice(i + 1)))), []);
        }
    };

    return recurse([], arr);
}

/**
 * Converts tile gradients to colors
 * @param gradient the gradient of the tile to color
 * @returns {string} the rgb color
 */
export function gradientToRgb(gradient) {
    const r = Math.floor(0x33 + gradient * 0x99);
    const g = Math.floor(0x99 + gradient * 0x55);
    const b = Math.floor(0xDD + gradient * 0x33);
    return `rgb(${r},${g},${b})`;
}

/* DIAMOND-SQUARE ALGORITHM */

function diamondSquareInitCorners(cells, size, init) {
    cells[0] = init;
    cells[size - 1] = init;
    cells[size * (size - 1)] = init;
    cells[(size + 1) * (size - 1)] = init;
}

function diamondSquareUpdateDiamond(cells, x, y, half, size, amp) {
    const tl = cells[(y - half) * size + (x - half)];
    const tr = cells[(y - half) * size + (x + half)];
    const bl = cells[(y + half) * size + (x - half)];
    const br = cells[(y + half) * size + (x + half)];
    const offset = (Math.random() - 0.5) * amp;
    const mean = (tl + tr + bl + br) / 4;
    cells[y * size + x] = clamp(mean + offset, 0.0, 1.0);
}

function diamondSquareUpdateSquare(cells, x, y, half, size, amp) {
    const neighbours = [];
    if (x > 0) {
        neighbours.push(cells[y * size + (x - half)]);
    }
    if (y > 0) {
        neighbours.push(cells[(y - half) * size + x]);
    }
    if (x < (size - 1)) {
        neighbours.push(cells[y * size + (x + half)]);
    }
    if (y < (size - 1)) {
        neighbours.push(cells[(y + half) * size + x]);
    }
    const offset = (Math.random() - 0.5) * amp;
    const mean = neighbours.reduce((a, b) => a + b, 0.0) / neighbours.length;
    cells[y * size + x] = clamp(mean + offset, 0.0, 1.0);
}

function diamondSquareUpdate(cells, size, frequency, spectrum) {
    const amp = spectrum(frequency);
    const grid = (size - 1) / frequency;
    const half = grid >> 1;
    if (half < 1) {
        return;
    }
    for (let i = 0; i < frequency; ++i) {
        for (let j = 0; j < frequency; ++j) {
            const y = half + i * grid;
            const x = half + j * grid;
            diamondSquareUpdateDiamond(cells, x, y, half, size, amp);
        }
    }
    for (let i = 0; i < frequency * 2 + 1; ++i) {
        for (let j = (i + 1) % 2; j < (frequency << 1) + 1; j += 2) {
            const x = j * half;
            const y = i * half;
            diamondSquareUpdateSquare(cells, x, y, half, size, amp);
        }
    }
    diamondSquareUpdate(cells, size, frequency << 1, spectrum);
}

export function diamondSquareGenerate(size, spectrum = f => 1/f, init = 0.5) {
    const l = (2 << (size - 1)) + 1;
    const cells = new Float32Array(l * l);
    diamondSquareInitCorners(cells, l, init);
    diamondSquareUpdate(cells, l, 1, spectrum);
    return cells;
}
