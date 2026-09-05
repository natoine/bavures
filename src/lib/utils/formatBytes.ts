const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Formate une taille en octets en une chaîne lisible (ex: "1.4 MB"). */
export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return '—';
	if (bytes === 0) return '0 B';

	const exponent = Math.min(Math.floor(Math.log2(bytes) / 10), UNITS.length - 1);
	const value = bytes / Math.pow(1024, exponent);
	const formatted = exponent === 0 ? value.toString() : value.toFixed(1);

	return `${formatted} ${UNITS[exponent]}`;
}
