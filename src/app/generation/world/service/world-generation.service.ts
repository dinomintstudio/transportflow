import {Injectable} from '@angular/core';
import * as config from '../config/world-generation.config.json'

@Injectable({
	providedIn: 'root'
})
export class WorldGenerationService {

	constructor() {
		config;
	}

}
