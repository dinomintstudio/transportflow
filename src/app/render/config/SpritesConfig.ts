/**
 * Sprites configuration
 */
export class SpritesConfig {

	/**
	 * Array of pairs [<sprite name>, <sprite location>]
	 */
	sprites: String[][]

	constructor(sprites: String[][]) {
		this.sprites = sprites
	}

	/**
	 * Construct config from json config file
	 * @param json
	 */
	static load(json: any): SpritesConfig {
		return new SpritesConfig(
			json.sprites
		)
	}

}
