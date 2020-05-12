export class SpritesConfig {

	sprites: any

	constructor(sprites: any) {
		this.sprites = sprites
	}

	static load(json: any): SpritesConfig {
		return new SpritesConfig(
			json.sprites
		)
	}

}
