import {Matrix} from '../../common/model/Matrix'
import {Tile} from './Tile'
import {Position} from '../../common/model/Position'
import {GeneratedCityTemplate} from '../../generation/city/model/GeneratedCityTemplate'

export class CityPlan {

	generatedCity: GeneratedCityTemplate
	position: Position
	tilemap: Matrix<Tile>

}