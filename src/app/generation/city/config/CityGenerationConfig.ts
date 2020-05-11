import {StreetGenerationConfig} from '../../street/config/StreetGenerationConfig'

/**
 * Describes options for city generation
 */
export class CityGenerationConfig {

	/**
	 * Maximum distance from tile to road which can contain building block
	 */
	closestRoadDistance: number

	/**
	 * Probability of building block to appear in certain tile
	 */
	buildingBlockAppearanceProbability: number

	/**
	 * Street generation config
	 */
	streetGenerationConfig: StreetGenerationConfig

	constructor(closestRoadDistance: number, buildingBlockAppearanceProbability: number, streetGenerationConfig: StreetGenerationConfig) {
		this.closestRoadDistance = closestRoadDistance
		this.buildingBlockAppearanceProbability = buildingBlockAppearanceProbability
		this.streetGenerationConfig = streetGenerationConfig
	}

}