export function formatUser(userId: string): string {
	return '<@' + userId + '>' + ' (`' + userId + '`)';
}

export function formatCode(string: string): string {
	return '`' + string + '`';
}
