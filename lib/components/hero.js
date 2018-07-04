import React from 'react';
import { gradientToRgb, diamondSquareGenerate } from '..';

const TERRAIN_GRID_EXP_SIZE = 6;
const TERRAIN_GRID_SIZE = 65;
const CANVAS_RESOLUTION = 4096;
const CANVAS_RATIO = 16/9;
const X_SCALE = 0.85;
const Y_SCALE = 0.5;
const MAX_HEIGHT = 1024;

class WorldBuilder {
    constructor(config) {
        this.config = config;
    }

    build() {
        const landmarks = [];
        const terrain = diamondSquareGenerate(this.config.size, f => 1/f, 0.5);
        return {
            landmarks,
            terrain
        }
    }
}

const drawTerrainLayer = (ctx, scale, terrain, size, height) => {
    const tileWidth = scale / (TERRAIN_GRID_SIZE - 1);
    const tileHeight = tileWidth * (Y_SCALE / X_SCALE);
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let y1 = 0; y1 < TERRAIN_GRID_SIZE - 1; ++y1) {
        for (let x1 = 0; x1 < TERRAIN_GRID_SIZE - 1; ++x1) {
            const x2 = x1 + 1;
            const y2 = y1 + 1;
            const nw = terrain[y1 * size + x1] * height;
            const ne = terrain[y1 * size + x2] * height;
            const sw = terrain[y2 * size + x1] * height;
            const se = terrain[y2 * size + x2] * height;

            ctx.save();
            ctx.fillStyle = gradientToRgb((nw - (ne + sw) / 2) / height);
            ctx.beginPath();
            ctx.moveTo((x1 - y1) * tileWidth, (x1 + y1) * tileHeight - nw);
            ctx.lineTo((x2 - y1) * tileWidth, (x2 + y1) * tileHeight - ne);
            ctx.lineTo((x1 - y2) * tileWidth, (x1 + y2) * tileHeight - sw);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = gradientToRgb(((ne + sw) / 2 - se) / height);
            ctx.beginPath();
            ctx.moveTo((x2 - y2) * tileWidth, (x2 + y2) * tileHeight - se);
            ctx.lineTo((x1 - y2) * tileWidth, (x1 + y2) * tileHeight - sw);
            ctx.lineTo((x2 - y1) * tileWidth, (x2 + y1) * tileHeight - ne);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
    ctx.restore();
};

const drawLandmarkLayer = (ctx, landmarks, terrain) => {

};

export class HeroComponent extends React.Component {
    render() {
        return (
            <canvas id="hero-canvas"/>
        );
    }

    componentDidMount() {
        const canvas = document.getElementById('hero-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = CANVAS_RESOLUTION;
        canvas.height = CANVAS_RESOLUTION / CANVAS_RATIO;

        const world = new WorldBuilder({
            size: TERRAIN_GRID_EXP_SIZE,
            landmarks: [
                { name: 'Clearing' },
                { name: 'Forest' },
                { name: 'Town' },
                { name: 'Lake' },
                { name: 'Mountain' }
            ]
        }).build();
        const landmarks = world.landmarks;
        const terrain = world.terrain;

        ctx.save();
        ctx.translate(CANVAS_RESOLUTION / 2, MAX_HEIGHT);
        drawTerrainLayer(ctx, CANVAS_RESOLUTION / 2, terrain, TERRAIN_GRID_SIZE, MAX_HEIGHT);
        drawLandmarkLayer(ctx, CANVAS_RESOLUTION / 2, landmarks, terrain);
        ctx.restore();
    }
}