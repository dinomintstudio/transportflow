import {Injectable} from '@angular/core'
import {ConfigService} from '../../common/service/config.service'

/**
 * Responsible for loading and caching sprites
 */
@Injectable({
	providedIn: 'root'
})
export class SpriteService {

	/**
	 * Map <sprite name> -> <sprite url>
	 */
	private spriteUrlMap: Map<string, string>

	/**
	 * Map <sprite name> -> <sprite element>
	 */
	private spriteMap: Map<string, HTMLImageElement>

	/**
	 * Indicates that sprites are already loaded or not
	 */
	private spritesLoaded: boolean

	constructor(
		private configService: ConfigService
	) {
		this.spriteMap = new Map<string, HTMLImageElement>()
		this.configService.spritesConfig.observable.subscribe(config =>
			this.spriteUrlMap = new Map<string, string>(<[]>config.sprites)
		)
		this.spritesLoaded = false
	}

	/**
	 * Load all sprites form sprites config
	 * @param onload on successful load
	 */
	loadSprites(onload: () => void = () => {}): void {
		if (this.spritesLoaded) {
			onload()
			return
		}
		this.configService.spritesConfig.observable.subscribe(spritesConfig => {
			let spritesLoaded = 0

			const spritesCount = spritesConfig.sprites.length
			if (this.spriteMap.size === spritesCount) onload()

			this.spriteUrlMap.forEach((path, name) =>
				this.loadImage(path, sprite => {
					this.spriteMap.set(name, sprite)
					spritesLoaded++
					if (spritesLoaded === spritesCount) {
						onload()
						this.spritesLoaded = true
					}
				})
			)
		})
	}

	/**
	 * Get cached sprite by name
	 * @param spriteName
	 */
	fetch(spriteName: string): HTMLImageElement {
		return this.spriteMap.get(spriteName)
	}

	private loadImage(url: string, onload: (image: HTMLImageElement) => void): void {
		let image: HTMLImageElement = new Image()
		image.onload = () => {
			onload(image)
		}
		image.src = url
	}

}
