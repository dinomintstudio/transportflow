import {Position} from "../../common/model/Position";

export class Camera {

	position: Position;
	zoom: number;

	constructor(position: Position, zoom: number = 1) {
		this.position = position;
		this.zoom = zoom;
	}

}