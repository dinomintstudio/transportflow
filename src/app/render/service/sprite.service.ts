import {Injectable} from '@angular/core'
import * as spritesConfig from '../config/sprites.config.json'

@Injectable({
	providedIn: 'root'
})
export class SpriteService {

	// @ts-ignore
	private spriteUrlMap = new Map<string, string>(spritesConfig.sprites)
	private spriteMap = new Map<string, HTMLImageElement>()

	constructor() {
	}

	loadSprites(onload: () => void = () => {
	}): void {
		let spritesLoaded = 0
		const spritesCount = spritesConfig.sprites.length

		if (this.spriteMap.size === spritesCount) onload()

		this.spriteUrlMap.forEach((v, k) => {
				return this.loadImage(v, (image => {
						this.spriteMap.set(k, image)
						spritesLoaded++
						if (spritesLoaded === spritesCount) onload()
					}
				))
			}
		)
	}

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
