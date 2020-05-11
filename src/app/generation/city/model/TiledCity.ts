import {GeneratedCityTemplate} from './GeneratedCityTemplate'
import {Matrix} from '../../../common/model/Matrix'
import {CityTile} from './CityTile'
import {Maybe} from '../../../common/model/Maybe'

/**
 * Generated city template applied to tilemap (but not terrain yet)
 */
export class TiledCity {

	/**
	 * Generated city template by which tilemap is built
	 */
	generatedCityTemplate: GeneratedCityTemplate

	/**
	 * City tilemap without appliance to the terrain. Note that matrix contains Maybe objects, because city does not
	 * necessary take up each rectangle's tile
	 */
	tilemap: Matrix<Maybe<CityTile>>

	constructor(generatedCityTemplate: GeneratedCityTemplate, tilemap: Matrix<Maybe<CityTile>>) {
		this.generatedCityTemplate = generatedCityTemplate
		this.tilemap = tilemap
	}

}