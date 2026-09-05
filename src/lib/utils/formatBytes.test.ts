import { describe, expect, it } from 'vitest';
import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
	it('formate des tailles courantes (cas nominal)', () => {
		expect(formatBytes(500)).toBe('500 B');
		expect(formatBytes(1536)).toBe('1.5 KB');
		expect(formatBytes(1_500_000)).toBe('1.4 MB');
	});

	it('gère zéro (cas limite)', () => {
		expect(formatBytes(0)).toBe('0 B');
	});

	it("retourne un tiret pour une valeur invalide (cas d'erreur)", () => {
		expect(formatBytes(-5)).toBe('—');
		expect(formatBytes(NaN)).toBe('—');
	});
});
