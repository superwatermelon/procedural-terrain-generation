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

/* LANDMARK PLACEMENT */

// If we were unable to produce a suitable result within this many attempts
// simply return the last attempt.
const GENERATE_ITERATION_LIMIT = 999;

function generateRandomPoints(count, width, height) {
    const points = [];
    for (let i = 0; i < count; ++i) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        points.push([x, y]);
    }
    return points;
}

export function generateLandmarks(count, width, height, distance) {
    let iterations = 0;
    let points, score, result;
    let start = Date.now();

    // Iterate until all points are min distance apart and a path matching
    // all rules can be found, or we hit the limit of iterations.
    while (++iterations) {
        points = generateRandomPoints(count, width, height);
        score = validateLandmarksMinSeparation(points, distance) * 1;
        if (score || iterations >= GENERATE_ITERATION_LIMIT) {
            continue;
        }
        result = assignPoints(points, distance);
        if (!result.score && iterations < GENERATE_ITERATION_LIMIT) {
            continue;
        }
        return {
            points: result.points,
            iterations: iterations,
            time: Date.now() - start
        };
    }
}

export function generateLandmarksV2(count, width, height, distance) {
    let iterations = 0;
    let points, score, result;
    let start = Date.now();

    // Iterate until all points are min distance apart and a path matching
    // the rules can be found, or we hit the limit of iterations.
    while (++iterations) {
        points = generateRandomPoints(count, width, height);
        score = validateLandmarksMinSeparation(points, distance) * 1;
        if (!score && iterations < GENERATE_ITERATION_LIMIT) {
            continue;
        }
        result = assignPointsV2(points, distance);
        if (!result.score && iterations < GENERATE_ITERATION_LIMIT) {
            continue;
        }
        return {
            points: result.points,
            iterations: iterations,
            time: Date.now() - start
        };
    }
}

export function generateLandmarksV3(count, width, height, distance) {
    let iterations = 0;
    let points, score;
    let start = Date.now();

    // Iterate until all points are min distance apart
    while (++iterations) {
        points = generateRandomPoints(count, width, height);
        score = validateLandmarksMinSeparation(points, distance) * 1;
        if (score || iterations >= GENERATE_ITERATION_LIMIT) {
            break;
        }
    }

    // Find hamiltonian shortest path between furthest two nodes
    return {
        points: optimizeLandmarkPath(points),
        iterations: iterations,
        time: Date.now() - start
    };
}

function optimizeLandmarkPath(points) {
    const result = permutations(points).map(points => ({
        points,
        distance: pathDistance(points)
    }));
    result.sort((a, b) => a.distance - b.distance);
    return result[0].points;
}

function pathDistance(points) {
    let result = 0;
    for (let i = 0; i < points.length - 1; ++i) {
        const a = points[i];
        const b = points[i+1];
        const dx = Math.abs(a[0] - b[0]);
        const dy = Math.abs(a[1] - b[1]);
        const d = dx * dx + dy * dy;
        result += d;
    }
    return result;
}

/**
 * Tests given a series of points that mid points are closer to
 * each other than end points. Subdivides the list of points
 * recursively testing smaller chunks of the list of points.
 *
 * @param points
 * @returns {boolean} whether or not all mid points are closer
 */
function validateLandmarks(points, from, to) {
    from = from || 0;
    to = to || points.length - 1;
    const l = to - from + 1;
    if (l < 3) {
        return true;
    }
    const start = points[from];
    const end = points[to];
    const pivot = l >> 1;
    const selected = points[pivot];
    const ax = Math.abs(start[0] - end[0]);
    const ay = Math.abs(start[1] - end[1]);
    const bx = Math.abs(start[0] - selected[0]);
    const by = Math.abs(start[1] - selected[1]);
    const cx = Math.abs(selected[0] - end[0]);
    const cy = Math.abs(selected[1] - end[1]);
    const a = ax * ax + ay * ay;
    const b = bx * bx + by * by;
    const c = cx * cx + cy * cy;
    if (a < b || a < c) {
        return false;
    }
    for (let i = from; i < l - pivot + 1; i += pivot) {
        if (!validateLandmarks(points, i, i + pivot)) {
            return false;
        }
    }
    return true;
}

function validateLandmarksV2(points, from, to) {
    from = from || 0;
    to = to || points.length - 1;
    const l = to - from + 1;
    if (l < 3) {
        return true;
    }
    if (
        validateLandmarksFurthestPoints(points, from, to) &&
        validateLandmarksNearestPoints(points, from, from + 1) &&
        validateLandmarksNearestPoints(points, to, to - 1)
    ) {
        return validateLandmarksV2(points, from + 1, to - 1);
    }
    return false;
}

function validateLandmarksFurthestPoints(points, i, j) {
    const start = points[i];
    const end = points[j];
    const ax = Math.abs(start[0] - end[0]);
    const ay = Math.abs(start[1] - end[1]);
    const a = ax * ax + ay * ay;
    for (let k = i + 1; k < j; ++k) {
        const selected = points[i];
        const bx = Math.abs(start[0] - selected[0]);
        const by = Math.abs(start[1] - selected[1]);
        const cx = Math.abs(selected[0] - end[0]);
        const cy = Math.abs(selected[1] - end[1]);
        const b = bx * bx + by * by;
        const c = cx * cx + cy * cy;
        if (a < b || a < c) {
            return false;
        }
    }
    return true;
}

function validateLandmarksNearestPoints(points, i, j) {
    const start = points[i];
    const nearest = points[j];
    const l = points.length;
    const ax = Math.abs(start[0] - nearest[0]);
    const ay = Math.abs(start[1] - nearest[1]);
    const a = ax * ax + ay * ay;
    for (let k = 0; k < l; ++k) {
        if (k === i || k === j) {
            continue;
        } else {
            const selected = points[k];
            const bx = Math.abs(start[0] - selected[0]);
            const by = Math.abs(start[1] - selected[1]);
            const b = bx * bx + by * by;
            if (a > b) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Test all edges between landmarks are at least the specified
 * distance apart. Uses squared distance rather than euclidean
 * distance for speed as does not require the square root calculation.
 * Requires n(n-1)/2 calculations.
 *
 * @param points the points to test min distances
 * @param d the minimum distance
 * @returns {boolean} whether or not the points pass the min distance test
 */
function validateLandmarksMinSeparation(points, d) {
    for (let i = 0; i < points.length; ++i) {
        for (let j = i + 1; j < points.length; ++j) {
            const a = points[i];
            const b = points[j];
            const dx = Math.abs(a[0] - b[0]);
            const dy = Math.abs(a[1] - b[1]);
            if ((dx * dx + dy * dy) < d * d) {
                return false;
            }
        }
    }
    return true;
}

function assignPoints(points, distance) {
    const perms = permutations(points);
    const scored = perms.map(points => ({
        points,
        score: validateLandmarks(points) * 1
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
}

function assignPointsV2(points, distance) {
    const perms = permutations(points);
    const scored = perms.map(points => ({
        points,
        score: validateLandmarksV2(points) * 1
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
}

/* RANDOM NOISE */

export function generateRandomHeights(size) {
    const heights = new Float32Array(size * size);
    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            heights[y * size + x] = Math.random();
        }
    }
    return heights;
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
    const cells = new Float32Array(size * size);
    diamondSquareInitCorners(cells, size, init);
    diamondSquareUpdate(cells, size, 1, spectrum);
    return cells;
}

/* TERRAIN RENDERING */

const TERRAIN_MAX_HEIGHT = 128;
const TERRAIN_X_TO_Y_RATIO = 0.5 / 0.85;

export function drawTerrainToContext(ctx, half, size, heights, max) {
    const tile = half / (size - 1);

    ctx.save();
    ctx.translate(half, 0);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    for (let y = 0; y < size - 1; ++y) {
        for (let x = 0; x < size - 1; ++x) {

            const nw = Math.floor(heights[y * size + x] * max);
            const ne = Math.floor(heights[y * size + x + 1] * max);
            const sw = Math.floor(heights[(y + 1) * size + x] * max);
            const se = Math.floor(heights[(y + 1) * size + x + 1] * max);

            const top = x * TERRAIN_X_TO_Y_RATIO * tile + y * TERRAIN_X_TO_Y_RATIO * tile + max;
            const left = x * tile - y * tile;

            ctx.beginPath();
            ctx.moveTo(left, top - nw);
            ctx.lineTo(left + tile, top - ne + TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo(left - tile, top - sw + TERRAIN_X_TO_Y_RATIO * tile);
            ctx.closePath();

            ctx.fillStyle = gradientToRgb((nw - (ne + sw) / 2) / max);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(left, top - se + 2 * TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo(left + tile, top - ne + TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo(left - tile, top - sw + TERRAIN_X_TO_Y_RATIO * tile);
            ctx.closePath();

            ctx.fillStyle = gradientToRgb(((ne + sw) / 2 - se) / max);
            ctx.fill();
            ctx.stroke();
        }
    }

    ctx.restore();
}

export function drawTerrain(canvas, width, size, heights, max = TERRAIN_MAX_HEIGHT) {

    canvas.width = width;
    canvas.height = width * TERRAIN_X_TO_Y_RATIO + max;

    const half = 0.5 * width;
    const ctx = canvas.getContext('2d');
    drawTerrainToContext(ctx, half, size, heights, max);
}

/* LANDMARK RENDERING */

const FONT = '30px Roboto';
const BACKGROUND_COLOR = '#39D';
const FOREGROUND_COLOR = '#FFF';
const MARKER_HEIGHT = 50;
const MARKER_RADIUS = 30;
const MARKER_GAP = 10;
const BOUNDARY = 100;

function drawLandmarksMarker(ctx, y, x, tile, point, height, max, shadow = BACKGROUND_COLOR) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo((-y + x) * tile, max + (y + x) * TERRAIN_X_TO_Y_RATIO * tile - MARKER_GAP - height);
    ctx.arc((-y + x) * tile, max + (y + x) * TERRAIN_X_TO_Y_RATIO * tile - MARKER_HEIGHT - height, MARKER_RADIUS, 3 * Math.PI / 4, Math.PI / 4, false);
    ctx.closePath();

    ctx.fillStyle = FOREGROUND_COLOR;
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();

    ctx.restore();

    ctx.save();

    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillText(point.name, (-y + x) * tile, max + (y + x) * TERRAIN_X_TO_Y_RATIO * tile - MARKER_HEIGHT - height);

    ctx.restore();
}

function drawLandmarksPath(ctx, tile, landmarks) {
    ctx.save();

    ctx.beginPath();
    for (let i = 0; i < landmarks.length; ++i) {
        const x = landmarks[i][0];
        const y = landmarks[i][1];
        if (i === 0) {
            ctx.moveTo((-y + x) * tile, (y + x) * TERRAIN_X_TO_Y_RATIO * tile);
        } else {
            ctx.lineTo((-y + x) * tile, (y + x) * TERRAIN_X_TO_Y_RATIO * tile);
        }
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = BACKGROUND_COLOR;
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.restore();
}

function drawLandmarksBoundary(ctx, canvasWidth) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvasWidth - BOUNDARY, (-BOUNDARY + canvasWidth) * TERRAIN_X_TO_Y_RATIO);
    ctx.lineTo(0, (-BOUNDARY + canvasWidth) * 2 * TERRAIN_X_TO_Y_RATIO);
    ctx.lineTo(-canvasWidth + BOUNDARY, (-BOUNDARY + canvasWidth) * TERRAIN_X_TO_Y_RATIO);
    ctx.closePath();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
}

function drawLandmarksGrid(ctx, size, tile) {
    ctx.save();

    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 1;

    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            ctx.beginPath();
            ctx.moveTo((-y + x) * tile, (y + x) * TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo((-y + x + 1) * tile, (y + x + 1) * TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo((-y + x) * tile, (y + x + 2) * TERRAIN_X_TO_Y_RATIO * tile);
            ctx.lineTo((-y + x - 1) * tile, (y + x + 1) * TERRAIN_X_TO_Y_RATIO * tile);
            ctx.closePath();
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawLandmarksArea(ctx, half) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, -BOUNDARY * TERRAIN_X_TO_Y_RATIO);
    ctx.lineTo(half, (-BOUNDARY + half) * TERRAIN_X_TO_Y_RATIO);
    ctx.lineTo(0, (-BOUNDARY + half * 2) * TERRAIN_X_TO_Y_RATIO);
    ctx.lineTo(-half, (-BOUNDARY + half) * TERRAIN_X_TO_Y_RATIO);
    ctx.closePath();

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fill();

    ctx.restore();
}

export function drawLandmarkMarkers(ctx, tile, landmarks, heightfn, max, shadow = BACKGROUND_COLOR) {
    const points = landmarks.map((point, i) => ({point, name: String.fromCharCode(65 + i)}));
    points.sort((a, b) => (a.point[0] + a.point[1]) - (b.point[0] + b.point[1]));

    for (let i = 0; i < landmarks.length; ++i) {
        const x = points[i].point[0];
        const y = points[i].point[1];

        drawLandmarksMarker(ctx, y, x, tile, points[i], heightfn(x, y), max, shadow);
    }
}

export function drawLandmarks(size, width, canvas, landmarks) {

    const half = 0.5 * width;
    const top = MARKER_HEIGHT;
    const tile = (half - BOUNDARY) / size;

    canvas.width = width;
    canvas.height = top + width * TERRAIN_X_TO_Y_RATIO;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.strokeStyle = FOREGROUND_COLOR;

    ctx.translate(half, top + BOUNDARY * TERRAIN_X_TO_Y_RATIO);

    drawLandmarksArea(ctx, half);
    drawLandmarksGrid(ctx, size, tile);
    drawLandmarksBoundary(ctx, half);
    drawLandmarksPath(ctx, tile, landmarks);

    drawLandmarkMarkers(ctx, tile, landmarks, () => 0, 0);
}
