import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SpriteService {

	private imageMap = new Map<string, HTMLImageElement>();

	constructor() {
	}

	fetch(url: string, onload: (image: HTMLImageElement) => void) {
		const fromMap = this.imageMap.get(url);
		if (fromMap) {
			onload(fromMap);
		} else {
			this.loadImage(url, (i) => {
				onload(i);

				if (!this.imageMap.get(url)) {
					this.imageMap.set(url, i);
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
