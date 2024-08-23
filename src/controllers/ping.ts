export function formatMilliseconds(ms: number): string {
	const seconds = 1000;
	const minutes = seconds * 60;
	const hours = minutes * 60;
	const days = hours * 24;

	if (ms >= days * 2) return `${Math.round(ms / days)} days`;
	if (ms >= hours * 2) return `${Math.round(ms / hours)} hours`;
	if (ms >= minutes * 2) return `${Math.round(ms / minutes)} minutes`;
	return `${Math.round(ms / seconds)} seconds`;
}
