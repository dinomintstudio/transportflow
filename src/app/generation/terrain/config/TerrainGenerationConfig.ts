import {Shape} from "../../../common/model/Shape";
import {TemperatureMapConfig} from "./noisemap/TemperatureMapConfig";
import {AltitudeMapConfig} from "./noisemap/AltitudeMapConfig";
import {HumidityMapConfig} from "./noisemap/HumidityMapConfig";
import {BiomesConfig} from "./biome/BiomesConfig";
import {NoiseConfig} from "../../../math/config/NoiseConfig";

/**
 * Configuration of terrain generation
 */
export class TerrainGenerationConfig {

	/**
	 * Tilemap size in tiles
	 */
	mapSize: Shape;

	/**
	 * Probability of city appearance per tile. Between 0 and 1
	 */
	cityPerTile: number;

	/**
	 * Altitude map configuration
	 */
	altitudeMapConfig: AltitudeMapConfig;

	/**
	 * Temperature map configuration
	 */
	temperatureMapConfig: TemperatureMapConfig;

	/**
	 * Humidity map configuration
	 */
	humidityMapConfig: HumidityMapConfig;

	/**
	 * Fertility noise configuration.
	 * Fertility shows probability of tree appearing within a tile.
	 */
	fertilityNoiseConfig: NoiseConfig;

	/**
	 * Biomes configuration
	 */
	biomesConfig: BiomesConfig;

	/**
	 * Constructs config
	 * @param mapSize
	 * @param cityPerTile
	 * @param altitudeMapConfig
	 * @param temperatureMapConfig
	 * @param humidityMapConfig
	 * @param biomesConfig
	 */
	constructor(mapSize: Shape, cityPerTile: number, altitudeMapConfig: AltitudeMapConfig, temperatureMapConfig: TemperatureMapConfig, humidityMapConfig: HumidityMapConfig, biomesConfig: BiomesConfig, fertilityNoiseConfig: NoiseConfig) {
		this.mapSize = mapSize;
		this.cityPerTile = cityPerTile;
		this.altitudeMapConfig = altitudeMapConfig;
		this.temperatureMapConfig = temperatureMapConfig;
		this.humidityMapConfig = humidityMapConfig;
		this.biomesConfig = biomesConfig;
		this.fertilityNoiseConfig = fertilityNoiseConfig;
	}

}
