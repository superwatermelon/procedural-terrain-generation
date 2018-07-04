import { expect } from 'chai';
import { diamondSquareGenerate } from '../lib';

describe('diamond-square', () => {
    it('generates noise with the size (2^2+1)^2', () => {
        const noise = diamondSquareGenerate(2);
        expect(noise.length).equal(5 * 5);
    });

    it('generates noise with the size (2^8+1)^2', () => {
        const noise = diamondSquareGenerate(8);
        expect(noise.length).equals(257 * 257);
    });

    it('initializes the corners to the init value 0', () => {
        const noise = diamondSquareGenerate(1, f => 1/f, 0);
        expect(noise[0]).equals(0);
        expect(noise[2]).equals(0);
        expect(noise[6]).equals(0);
        expect(noise[8]).equals(0);
    });

    it('generates noise between 0.0 and 1.0', () => {
        const noise = diamondSquareGenerate(8);
        const filtered = noise.filter(height => height < 0 || height > 1);
        expect(filtered.length).equals(0);
    });

    it('generates a large noise map (2^11+1)^2', () => {
        const noise = diamondSquareGenerate(11);
        expect(noise.length).equals(2049 * 2049);
    });

    it('generates a flat noise map with a constant 0 spectrum function', () => {
        const noise = diamondSquareGenerate(2, f => 0);
        const filtered = noise.filter(height => height !== 0.5);
        expect(filtered.length).equals(0);
    });

    it('generates a random noise map with a constant 1 spectrum function', () => {
        const noise = diamondSquareGenerate(2, f => 1);
        const filtered = noise.filter(height => height !== 0.5);
        expect(filtered.length).not.equals(0);
    });
});