import {TestBed} from '@angular/core/testing'
import {Range} from '../../../common/model/Range'
import {TerrainGenerationService} from './terrain-generation.service'
import {TerrainGenerationConfig} from '../config/TerrainGenerationConfig'
import {Shape} from '../../../common/model/Shape'
import {AltitudeMapConfig} from '../config/noisemap/AltitudeMapConfig'
import {NoiseConfig} from '../../../common/config/NoiseConfig'
import {TemperatureMapConfig} from '../config/noisemap/TemperatureMapConfig'
import {HumidityMapConfig} from '../config/noisemap/HumidityMapConfig'
import {BiomesConfig} from '../config/biome/BiomesConfig'
import {DesertBiomeConfig} from '../config/biome/DesertBiomeConfig'
import {TaigaBiomeConfig} from '../config/biome/TaigaBiomeConfig'
import {JungleBiomeConfig} from '../config/biome/JungleBiomeConfig'
import {Position} from '../../../common/model/Position'

describe('TerrainGenerationService', () => {

	let service: TerrainGenerationService
	let config: TerrainGenerationConfig

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [TerrainGenerationService]})
		service = TestBed.get(TerrainGenerationService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
	})

	it('should generate terrain', () => {
		config = new TerrainGenerationConfig(
			new Shape(32, 32),
			0.002,
			new AltitudeMapConfig(
				new NoiseConfig(
					0.015
				),
				4,
				5,
				2
			),
			new TemperatureMapConfig(
				new NoiseConfig(
					0.001
				),
				4,
				1
			),
			new HumidityMapConfig(
				new NoiseConfig(
					0.01
				),
				9,
				0,
				0
			),
			new BiomesConfig(
				new DesertBiomeConfig(
					0.2
				),
				new TaigaBiomeConfig(
					0.75
				),
				new JungleBiomeConfig(
					0.9
				)
			),
			new NoiseConfig(
				0.03,
				new Range(0, 1)
			),
			0.1,
			0.06
		)

		const tiledTerrain = service.generate(config)

		expect(tiledTerrain.cityPoints.length).toBeGreaterThan(0)
		expect(tiledTerrain.tilemap.shape.width).toBe(32)
		expect(tiledTerrain.tilemap.shape.height).toBe(32)
		expect(tiledTerrain.tilemap.at(Position.ZERO)).toBeDefined()
	})

})