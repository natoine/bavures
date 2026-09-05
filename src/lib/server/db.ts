import { MongoClient, type Db } from 'mongodb';

// Charge `.env` dans `process.env` si présent. Nécessaire car ni `vite dev`
// ni `node build/index.js` (adapter-node) ne le font automatiquement pour le
// code serveur — Vite ne peuple que `import.meta.env` (variables `VITE_*`) et
// les modules virtuels `$env/*` de SvelteKit, jamais `process.env` lui-même.
// On lit ensuite directement `process.env` (plutôt que `$env/dynamic/private`)
// car ce module est server-only et `$env/dynamic/private` fige sa valeur au
// démarrage du serveur Vite, ce qui empêcherait de tester le cas d'erreur.
try {
	process.loadEnvFile();
} catch {
	// Pas de .env à la racine : en production, les variables sont en général
	// déjà fournies par la plateforme d'hébergement.
}

/**
 * Lit l'URI MongoDB depuis les variables d'environnement.
 * Lève une erreur explicite si elle est absente (cas d'erreur explicite plutôt
 * qu'un échec de connexion obscur plus tard).
 */
export function getMongoUri(): string {
	const uri = process.env.MONGODB_URI;
	if (!uri || uri.trim() === '') {
		throw new Error('MONGODB_URI manquante : définissez-la dans .env (voir .env.example)');
	}
	return uri;
}

/** Nom de la base, dérivé de l'env ou d'une valeur par défaut. */
export function getMongoDbName(): string {
	return process.env.MONGODB_DB?.trim() || 'bavures';
}

// Cache du client sur `global` pour éviter de ré-ouvrir une connexion à chaque
// rechargement HMR en dev, et pour réutiliser une connexion unique en prod.
declare global {
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
	// Timeout court : si MongoDB est injoignable, on échoue vite plutôt que de
	// bloquer une requête HTTP pendant la valeur par défaut du driver (30s).
	const client = new MongoClient(getMongoUri(), { serverSelectionTimeoutMS: 5000 });
	return client.connect();
}

/** Retourne une connexion MongoClient partagée (singleton). */
export function getMongoClientPromise(): Promise<MongoClient> {
	if (!globalThis._mongoClientPromise) {
		globalThis._mongoClientPromise = createClientPromise().catch((error: unknown) => {
			// On ne garde pas en cache une connexion échouée : un prochain appel
			// pourra retenter (utile si MongoDB démarre après l'application).
			globalThis._mongoClientPromise = undefined;
			throw error;
		});
	}
	return globalThis._mongoClientPromise;
}

/** Retourne la base de données applicative. */
export async function getDb(): Promise<Db> {
	const client = await getMongoClientPromise();
	return client.db(getMongoDbName());
}
