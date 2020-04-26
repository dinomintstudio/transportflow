import {InitService} from "./init.service";
import {TestBed} from "@angular/core/testing";

describe('InitService', () => {
	let service: InitService;

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [InitService]});
	});

	it('should initialize', () => {
		service = TestBed.get(InitService);
		console.log(service);
		expect().nothing();
	});

});