import {Building} from '../../../game-logic/model/Building'
import {IndexedCityTile} from './IndexedCityTile'

export class GeneratedBuilding {

	building: Building
	tiles: IndexedCityTile[]

	constructor(building: Building, tiles: IndexedCityTile[]) {
		this.building = building
		this.tiles = tiles
	}

}
