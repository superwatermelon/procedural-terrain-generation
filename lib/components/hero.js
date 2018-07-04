import React from 'react';
import { drawTerrainToContext, diamondSquareGenerate, generatePoints, drawLandmarkMarkers } from '..';

const TERRAIN_GRID_EXP_SIZE = 7;
const TERRAIN_GRID_SIZE = 129;
const CANVAS_RESOLUTION = 4096;
const CANVAS_RATIO = 16/9;
const MAX_HEIGHT = 1024;

class WorldBuilder {
    constructor(config) {
        this.config = config;
    }

    build() {
        const landmarks = generatePoints(5, TERRAIN_GRID_SIZE, TERRAIN_GRID_SIZE, 32);
        const terrain = diamondSquareGenerate(this.config.size, f => 1/f, 0.5);
        return {
            landmarks,
            terrain
        }
    }
}

function drawLandmarkLayer(ctx, half, size, landmarks, terrain) {
    const tile = half / (size - 1);
    ctx.save();
    ctx.translate(half, 0);
    drawLandmarkMarkers(ctx, tile, landmarks, (x, y) => terrain[y * size + x] * MAX_HEIGHT, MAX_HEIGHT);
    ctx.restore();
}

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
        drawTerrainToContext(ctx, CANVAS_RESOLUTION / 2, TERRAIN_GRID_SIZE, terrain, MAX_HEIGHT);
        drawLandmarkLayer(ctx, CANVAS_RESOLUTION / 2, TERRAIN_GRID_SIZE, landmarks.points, terrain);
        ctx.restore();
    }
}