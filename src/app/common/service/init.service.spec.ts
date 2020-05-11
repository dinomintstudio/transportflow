import {InitService} from './init.service'
import {TestBed} from '@angular/core/testing'

describe('InitService', () => {

	let service: InitService

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [InitService]})
		service = TestBed.get(InitService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
	})

})