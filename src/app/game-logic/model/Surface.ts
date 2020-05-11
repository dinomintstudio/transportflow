/**
 * Describes `Tile` surface
 */
export class Surface {

	/**
	 * Surface type
	 */
	type: 'water' | 'land' | 'mountain'

	/**
	 * Constructs new Surface instance
	 * @param type surface type
	 */
	constructor(type: 'water' | 'land' | 'mountain' = null) {
		this.type = type
	}

}