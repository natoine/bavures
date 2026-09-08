/**
 * Chemin SVG d'une barre arrondie en haut, carrée à la ligne de base (spec
 * du kit dataviz : "4px rounded data-end, square at the baseline"). Le
 * rayon est réduit si la barre est trop petite pour l'accueillir sans
 * artefact visuel.
 */
export function roundedTopBarPath(
	x: number,
	baseline: number,
	width: number,
	height: number,
	radius: number
): string {
	const safeHeight = Math.max(height, 0);
	const r = Math.max(0, Math.min(radius, width / 2, safeHeight / 2));
	const top = baseline - safeHeight;

	if (r === 0) {
		return `M ${x},${top} L ${x + width},${top} L ${x + width},${baseline} L ${x},${baseline} Z`;
	}

	return [
		`M ${x},${top + r}`,
		`Q ${x},${top} ${x + r},${top}`,
		`L ${x + width - r},${top}`,
		`Q ${x + width},${top} ${x + width},${top + r}`,
		`L ${x + width},${baseline}`,
		`L ${x},${baseline}`,
		'Z'
	].join(' ');
}
