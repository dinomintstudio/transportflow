import {Rectangle} from "../Rectangle";

export interface Canvas {

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void;

}
