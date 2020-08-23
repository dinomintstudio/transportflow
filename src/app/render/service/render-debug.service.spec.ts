import {TestBed} from '@angular/core/testing'

import {RenderDebugService} from './render-debug.service'

describe('RenderDebugService', () => {
	let service: RenderDebugService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(RenderDebugService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
