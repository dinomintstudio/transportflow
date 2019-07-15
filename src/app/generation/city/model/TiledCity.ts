import {GeneratedCityTemplate} from "./GeneratedCityTemplate";
import {Matrix} from "../../../common/model/Matrix";
import {CityTile} from "./CityTile";
import {Maybe} from "../../../common/model/Maybe";

export class TiledCity {

	generatedCityTemplate: GeneratedCityTemplate;
	tilemap: Matrix<Maybe<CityTile>>

}