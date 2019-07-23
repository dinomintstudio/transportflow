import {Building} from "./Building";
import {Rectangle} from "../../common/model/Rectangle";

export class House implements Building {

	position: Rectangle;

	constructor(position: Rectangle) {
		this.position = position;
	}

}