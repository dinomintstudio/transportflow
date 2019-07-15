export class Surface {

	type: 'water' | 'land' | 'mountain';

	constructor(type: "water" | "land" | "mountain" = null) {
		this.type = type;
	}

}