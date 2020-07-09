import {Injectable} from '@angular/core'
import {ConfigService} from '../../common/service/config.service'
import {createCanvas} from '../model/canvas/Canvas'
import {Shape} from '../../common/model/Shape'
import {SingleCanvas} from '../model/canvas/SingleCanvas'
import {Rectangle} from '../../common/model/Rectangle'
import {Position} from '../../common/model/Position'

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
	 * Map <sprite name> -> <sprite average color>.
	 * Color in hex format: #rrggbb
	 */
	private spriteColorMap: Map<string, string>

	/**
	 * Indicates that sprites are already loaded or not
	 */
	private spritesLoaded: boolean

	constructor(
		private configService: ConfigService
	) {
		this.spriteMap = new Map<string, HTMLImageElement>()
		this.spriteColorMap = new Map<string, string>()
		this.configService.spritesConfig.observable.subscribe(config =>
			this.spriteUrlMap = new Map<string, string>(<[]>config.sprites)
		)
		this.spritesLoaded = false
	}

	/**
	 * Load all sprites form sprites config and initialize average color map
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
					this.spriteColorMap.set(name, this.getAverageColor(sprite))
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

	/**
	 * Get average color of a cached sprite by name
	 * @param spriteName
	 */
	getColor(spriteName: string): string {
		return this.spriteColorMap.get(spriteName)
	}

	private loadImage(url: string, onload: (image: HTMLImageElement) => void): void {
		let image: HTMLImageElement = new Image()
		image.onload = () => {
			onload(image)
		}
		image.src = url
	}

	private getAverageColor(image: HTMLImageElement): string {
		const singlePixelCanvas = new SingleCanvas(createCanvas(Shape.square(1)))
		singlePixelCanvas.drawImage(image, Rectangle.rectangleByOnePoint(Position.ZERO, Shape.square(1)))
		const pixelData: Uint8ClampedArray = singlePixelCanvas.context.getImageData(0, 0, 1, 1).data
		const r: number = pixelData[0]
		const g: number = pixelData[1]
		const b: number = pixelData[2]
		return `#${((r << 16) | (g << 8) | b).toString(16)}`
	}

}
