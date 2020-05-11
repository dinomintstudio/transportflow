import {Matrix} from '../../common/model/Matrix'
import {Tile} from './Tile'
import {WorldGenerationConfig} from '../../generation/world/config/WorldGenerationConfig'

export class World {

	tilemap: Matrix<Tile>
	worldGenerationConfig: WorldGenerationConfig

	constructor(tilemap: Matrix<Tile>, worldGenerationConfig: WorldGenerationConfig) {
		this.tilemap = tilemap
		this.worldGenerationConfig = worldGenerationConfig
	}

}