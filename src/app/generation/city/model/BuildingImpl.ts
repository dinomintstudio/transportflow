import {Rectangle} from '../../../common/model/Rectangle'
import {Building} from '../../../game-logic/model/Building'

export class BuildingImpl implements Building {
	position: Rectangle

	constructor(position: Rectangle) {
		this.position = position
	}

}
