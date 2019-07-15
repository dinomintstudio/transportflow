import {Injectable} from '@angular/core';
import {CityGenerationConfig} from "../config/CityGenerationConfig";
import {TiledCity} from "../model/TiledCity";

@Injectable({
	providedIn: 'root'
})
export class CityGenerationService {

	constructor() {
	}

	generate(config: CityGenerationConfig): TiledCity[] {
		return null;
	}

}
