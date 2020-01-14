import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SpriteService {

	private spriteMap = new Map<string, HTMLImageElement>();

	constructor() {
	}

	fetch(url: string, onload: (image: HTMLImageElement) => void) {
		const fromMap = this.spriteMap.get(url);
		if (fromMap) {
			onload(fromMap);
		} else {
			this.loadImage(url, (i) => {
				onload(i);

				if (!this.spriteMap.get(url)) {
					this.spriteMap.set(url, i);
				}
			});
		}
	}

	private loadImage(url: string, onload: (image: HTMLImageElement) => void): void {
		let image: HTMLImageElement = new Image();
		image.onload = () => {
			onload(image);
		};
		image.src = url;
	}

}
