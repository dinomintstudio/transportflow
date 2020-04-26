import {TestBed} from "@angular/core/testing";
import {WorldGenerationService} from "./world-generation.service";

describe('TerrainGenerationService', () => {

	let service: WorldGenerationService;

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [WorldGenerationService]});
		service = TestBed.get(WorldGenerationService);
	});

	it('should initialize', () => {
		expect(service).toBeDefined();
	});

});