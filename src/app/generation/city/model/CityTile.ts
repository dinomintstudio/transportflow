/**
 * Describes city tile
 */
export class CityTile {

	/**
	 * City tile type
	 */
	type: 'building' | 'road';

	constructor(type: "building" | "road") {
		this.type = type;
	}

}