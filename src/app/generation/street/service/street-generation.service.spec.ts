import {TestBed} from '@angular/core/testing'
import {StreetGenerationConfig} from '../config/StreetGenerationConfig'
import {Range} from '../../../common/model/Range'
import {StreetGenerationService} from './street-generation.service'
import {Road} from '../model/Road'
import {RandomService} from '../../../common/service/random.service'
import {Position} from '../../../common/model/Position'

describe('StreetGenerationService', () => {

	let service: StreetGenerationService
	let randomService: RandomService
	let config: StreetGenerationConfig

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [StreetGenerationService]})
		service = TestBed.get(StreetGenerationService)
		randomService = TestBed.get(RandomService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
		expect(randomService).toBeDefined()
	})

	it('should generate streets', () => {
		config = new StreetGenerationConfig(
			new Range(0, 10),
			new Range(2, 4),
			2,
			new Range(1, 3)
		)
		const roads = service.generate(config)
		expect(roads.length).toBeGreaterThan(0)
		expect(roads[0]).toBeDefined()
	})

	/**
	 * Should generate tilemap:
	 * <pre><code>
	 * +-------+
	 * | x - - | x: road
	 * | x x x | -: no road
	 * | x - - |
	 * +-------+
	 * </pre></code>
	 */
	it('should apply roads to tilemap', () => {
		const roads = [
			new Road(randomService, new Position(0, 1), 0, Math.PI / 2, 3, config),
			new Road(randomService, new Position(1, 1), 0.5, 0, 3, config)
		]

		const booleanMatrix = service.roadsToRoadMask(roads)

		expect(booleanMatrix.at(new Position(0, 0))).toBe(true)
		expect(booleanMatrix.at(new Position(0, 1))).toBe(false)
		expect(booleanMatrix.at(new Position(0, 2))).toBe(false)
		expect(booleanMatrix.at(new Position(1, 0))).toBe(true)
		expect(booleanMatrix.at(new Position(1, 1))).toBe(true)
		expect(booleanMatrix.at(new Position(1, 2))).toBe(true)
		expect(booleanMatrix.at(new Position(2, 0))).toBe(true)
		expect(booleanMatrix.at(new Position(2, 1))).toBe(false)
		expect(booleanMatrix.at(new Position(2, 2))).toBe(false)
	})

})
