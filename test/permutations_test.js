import { permutations } from '../lib';
import { expect } from 'chai';

describe('permutations', () => {
    it('returns the single permutation for an array containing a single item', () => {
        expect(permutations([1])).deep.equal([[1]]);
    });

    it('returns the two permutations for an array of two items', () => {
        expect(permutations([1,2])).deep.equal([[1,2],[2,1]]);
    });

    it('returns the six permutations for an array of three items', () => {
        expect(permutations([1,2,3])).deep.equal([[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);
    });

    it('returns the single permutation for an array containing a single 2D point', () => {
        expect(permutations([[1,2]])).deep.equal([[[1,2]]]);
    });

    it('returns the two permutations for an array of two points', () => {
        expect(permutations([[1,2],[1,3]])).deep.equal([[[1,2],[1,3]],[[1,3],[1,2]]]);
    });
});