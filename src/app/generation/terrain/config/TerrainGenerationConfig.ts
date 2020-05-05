import {Shape} from "../../../common/model/Shape";
import {TemperatureMapConfig} from "./noisemap/TemperatureMapConfig";
import {AltitudeMapConfig} from "./noisemap/AltitudeMapConfig";
import {HumidityMapConfig} from "./noisemap/HumidityMapConfig";
import {BiomesConfig} from "./biome/BiomesConfig";
import {NoiseConfig} from "../../../util/config/NoiseConfig";

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
	 * Probability [0..1] of appearance of a random tree
	 */
	randomTreeProbability: number;

	/**
	 * How high above sea level beach will be generated.
	 * Measured in height units after normalization [0..1]
	 */
	beachHeight: number;

	/**
	 * Constructs config
	 * @param mapSize
	 * @param cityPerTile
	 * @param altitudeMapConfig
	 * @param temperatureMapConfig
	 * @param humidityMapConfig
	 * @param biomesConfig
	 * @param fertilityNoiseConfig
	 */
	constructor(mapSize: Shape, cityPerTile: number, altitudeMapConfig: AltitudeMapConfig, temperatureMapConfig: TemperatureMapConfig, humidityMapConfig: HumidityMapConfig, biomesConfig: BiomesConfig, fertilityNoiseConfig: NoiseConfig, randomTreeProbability: number, beachHeight: number) {
		this.mapSize = mapSize;
		this.cityPerTile = cityPerTile;
		this.altitudeMapConfig = altitudeMapConfig;
		this.temperatureMapConfig = temperatureMapConfig;
		this.humidityMapConfig = humidityMapConfig;
		this.biomesConfig = biomesConfig;
		this.fertilityNoiseConfig = fertilityNoiseConfig;
		this.randomTreeProbability = randomTreeProbability;
		this.beachHeight = beachHeight;
	}

}
