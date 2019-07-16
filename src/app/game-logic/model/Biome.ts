/**
 * Describes in-game biome
 */
export class Biome {

	/**
	 * Biome type
	 */
	type: 'taiga' | 'desert' | 'jungle';

	/**
	 * Constructs new Biome instance
	 * @param type biome type. Null by default
	 */
	constructor(type: "taiga" | "desert" | "jungle" = null) {
		this.type = type;
	}
}