import {Shape} from "../../../common/model/Shape";
import {TemperatureMapConfig} from "./noisemap/TemperatureMapConfig";
import {AltitudeMapConfig} from "./noisemap/AltitudeMapConfig";
import {HumidityMapConfig} from "./noisemap/HumidityMapConfig";
import {BiomesConfig} from "./biome/BiomesConfig";

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
	 * Probability of plant appearance per tile. Between 0 and 1
	 */
	plantPerTile: number;

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
	 * Biomes configuration
	 */
	biomesConfig: BiomesConfig;

	/**
	 * Constructs config
	 * @param mapSize
	 * @param cityPerTile
	 * @param plantPerTile
	 * @param altitudeMapConfig
	 * @param temperatureMapConfig
	 * @param humidityMapConfig
	 * @param biomesConfig
	 */
	constructor(mapSize: Shape, cityPerTile: number, plantPerTile: number, altitudeMapConfig: AltitudeMapConfig, temperatureMapConfig: TemperatureMapConfig, humidityMapConfig: HumidityMapConfig, biomesConfig: BiomesConfig) {
		this.mapSize = mapSize;
		this.cityPerTile = cityPerTile;
		this.plantPerTile = plantPerTile;
		this.altitudeMapConfig = altitudeMapConfig;
		this.temperatureMapConfig = temperatureMapConfig;
		this.humidityMapConfig = humidityMapConfig;
		this.biomesConfig = biomesConfig;
	}
}