import { formatCode } from '../../utils.js';

export function makeGraph(list: any) {
	const userMap: [string, number][] = [];
	list.forEach((el: any) => {
		let found = false;
		for (let i = 0; i < userMap.length; i++) {
			if (userMap[i][0] == el.staff) {
				userMap[i][1] += 1;
				found = true;
			}
		}
		if (!found) {
			userMap.push([el.staff, 1]);
		}
	});

	userMap.sort(function (a, b) {
		return b[1] - a[1];
	});

	let description = '';
	let max = 0;
	userMap.forEach((el) => {
		if (el[1] > max) max = el[1];
	});

	userMap.forEach((el) => {
		for (let i = 0; i < Math.floor((el[1] / max) * 10); i++) description += '▬';
		for (let i = Math.floor((el[1] / max) * 10); i < 10; i++) description += ' ';
		description += ` <@${el[0]}> (${formatCode(el[1].toString())})\n`;
	});
	return description;
}
