import {TestBed} from '@angular/core/testing'
import {CityGenerationService} from './city-generation.service'
import {CityGenerationConfig} from '../config/CityGenerationConfig'
import {StreetGenerationConfig} from '../../street/config/StreetGenerationConfig'
import {Range} from '../../../common/model/Range'

describe('CityGenerationService', () => {

	let service: CityGenerationService

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [CityGenerationService]})
		service = TestBed.get(CityGenerationService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
	})

	it('should generate city', () => {
		const tiledCity = service.generate(new CityGenerationConfig(
			2,
			0.8,
			new StreetGenerationConfig(
				new Range(0, 10),
				new Range(2, 4),
				2,
				new Range(1, 3)
			)
		))
		expect(tiledCity.generatedCityTemplate.roads.length).toBeGreaterThan(0)
		expect(tiledCity.generatedCityTemplate.buildings.length).toBeGreaterThan(0)
		expect(tiledCity.tilemap.shape.width).toBeGreaterThan(0)
		expect(tiledCity.tilemap.shape.height).toBeGreaterThan(0)
	})

})