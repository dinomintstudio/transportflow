import {TestBed} from '@angular/core/testing'

import {InteractionLayerRenderService} from './interaction-layer-render.service'

describe('InteractionLayerRenderService', () => {
	let service: InteractionLayerRenderService

	beforeEach(() => {
		TestBed.configureTestingModule({})
		service = TestBed.inject(InteractionLayerRenderService)
	})

	it('should be created', () => {
		expect(service).toBeTruthy()
	})
})
