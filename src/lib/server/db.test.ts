import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getMongoDbName, getMongoUri } from './db';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe('getMongoUri', () => {
	it("retourne l'URI configurée (cas nominal)", () => {
		process.env.MONGODB_URI = 'mongodb://localhost:27017/bavures';
		expect(getMongoUri()).toBe('mongodb://localhost:27017/bavures');
	});

	it("lève une erreur si la variable d'env est absente (cas d'erreur)", () => {
		delete process.env.MONGODB_URI;
		expect(() => getMongoUri()).toThrow(/MONGODB_URI/);
	});

	it("lève une erreur si la variable d'env est une chaîne vide (cas limite)", () => {
		process.env.MONGODB_URI = '   ';
		expect(() => getMongoUri()).toThrow(/MONGODB_URI/);
	});
});

describe('getMongoDbName', () => {
	it('retourne le nom configuré (cas nominal)', () => {
		process.env.MONGODB_DB = 'bavures_prod';
		expect(getMongoDbName()).toBe('bavures_prod');
	});

	it("retourne 'bavures' par défaut si absent (cas limite)", () => {
		delete process.env.MONGODB_DB;
		expect(getMongoDbName()).toBe('bavures');
	});
});
