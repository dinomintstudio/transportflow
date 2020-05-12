import {TestBed} from '@angular/core/testing'
import {ConfigService} from './config.service'

describe('ConfigService', () => {

	let service: ConfigService

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [ConfigService]})
		service = TestBed.get(ConfigService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
	})

})
