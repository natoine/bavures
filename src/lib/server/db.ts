import { MongoClient, type Db } from 'mongodb';

/**
 * Lit l'URI MongoDB depuis les variables d'environnement.
 * Lève une erreur explicite si elle est absente (cas d'erreur explicite plutôt
 * qu'un échec de connexion obscur plus tard).
 *
 * On lit directement `process.env` (plutôt que `$env/dynamic/private`) : ce
 * module est server-only, et `$env/dynamic/private` fige sa valeur au
 * démarrage du serveur Vite, ce qui empêche de tester les cas d'erreur.
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
	const client = new MongoClient(getMongoUri());
	return client.connect();
}

/** Retourne une connexion MongoClient partagée (singleton). */
export function getMongoClientPromise(): Promise<MongoClient> {
	if (!globalThis._mongoClientPromise) {
		globalThis._mongoClientPromise = createClientPromise();
	}
	return globalThis._mongoClientPromise;
}

/** Retourne la base de données applicative. */
export async function getDb(): Promise<Db> {
	const client = await getMongoClientPromise();
	return client.db(getMongoDbName());
}
