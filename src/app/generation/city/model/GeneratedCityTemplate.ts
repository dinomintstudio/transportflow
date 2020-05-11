import {Building} from '../../../game-logic/model/Building'
import {Road} from '../../street/model/Road'

/**
 * Output of the city generator. City in it does not applied to terrain underneath (There is no terrain where it will be
 * placed yet, actually)
 */
export class GeneratedCityTemplate {

	/**
	 * City roads
	 */
	roads: Road[]

	/**
	 * City buildings
	 */
	buildings: Building[]

	constructor(roads: Road[], buildings: Building[]) {
		this.roads = roads
		this.buildings = buildings
	}

}