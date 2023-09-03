export function formatUser(userId: string): string {
	return '<@' + userId + '>' + ' (`' + userId + '`)';
}

export function formatCode(string: string): string {
	return '`' + string + '`';
}

export async function execute(func: Promise<any>): Promise<any> {
	try {
		return await func;
	} catch (e) {
		return null;
	}
}
