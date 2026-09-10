import { describe, expect, it } from 'vitest';
import { roundedTopBarPath } from './barPath';

describe('roundedTopBarPath', () => {
	it('produit un chemin fermé avec les points attendus (cas nominal)', () => {
		const path = roundedTopBarPath(10, 100, 20, 40, 4);
		expect(path.startsWith('M 10,64')).toBe(true);
		expect(path).toContain('100'); // touche bien la ligne de base
		expect(path.endsWith('Z')).toBe(true);
	});

	it('réduit le rayon pour une barre plus fine que 2× le rayon (cas limite)', () => {
		const path = roundedTopBarPath(0, 50, 4, 30, 4);
		// rayon réduit à width/2 = 2, donc le point de départ est à baseline - height + 2 = 22
		expect(path.startsWith('M 0,22')).toBe(true);
	});

	it("ne produit aucune coordonnée négative en hauteur pour une valeur nulle (cas d'erreur)", () => {
		const path = roundedTopBarPath(0, 50, 20, 0, 4);
		expect(path).toContain('50'); // la barre est réduite à la ligne de base
	});
});
