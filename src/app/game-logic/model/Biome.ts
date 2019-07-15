/**
 * Describes in-game biome
 */
export class Biome {

	/**
	 * Biome type
	 */
	type: 'taiga' | 'desert' | 'jungle';


	constructor(type: "taiga" | "desert" | "jungle" = null) {
		this.type = type;
	}
}