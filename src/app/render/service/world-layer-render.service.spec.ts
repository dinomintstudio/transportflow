import {TestBed} from '@angular/core/testing'

import {WorldLayerRenderService} from './world-layer-render.service'

describe('WorldLayerRenderService', () => {
	let service: WorldLayerRenderService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(WorldLayerRenderService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
