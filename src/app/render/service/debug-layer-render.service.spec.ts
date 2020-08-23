import {TestBed} from '@angular/core/testing'

import {DebugLayerRenderService} from './debug-layer-render.service'

describe('DebugLayerRenderService', () => {
	let service: DebugLayerRenderService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(DebugLayerRenderService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
