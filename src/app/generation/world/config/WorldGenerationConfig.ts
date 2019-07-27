import {TerrainGenerationConfig} from "../../terrain/config/TerrainGenerationConfig";
import {CityGenerationConfig} from "../../city/config/CityGenerationConfig";

/**
 * Describe options for world generation
 */
export class WorldGenerationConfig {

	/**
	 * Terrain generation config
	 */
	terrainGenerationConfig: TerrainGenerationConfig;

	/**
	 * City generation config
	 */
	cityGenerationConfig: CityGenerationConfig;

	constructor(terrainGenerationConfig: TerrainGenerationConfig, cityGenerationConfig: CityGenerationConfig) {
		this.terrainGenerationConfig = terrainGenerationConfig;
		this.cityGenerationConfig = cityGenerationConfig;
	}

}