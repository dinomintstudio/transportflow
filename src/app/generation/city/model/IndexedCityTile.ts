import {Position} from '../../../common/model/Position'
import {CityTile} from './CityTile'
import {Maybe} from '../../../common/model/Maybe'

export class IndexedCityTile {

	position: Position
	tile: Maybe<CityTile>

	constructor(position: Position, tile: Maybe<CityTile>) {
		this.position = position
		this.tile = tile
	}

}