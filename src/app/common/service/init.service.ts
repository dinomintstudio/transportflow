import {Injectable} from '@angular/core';
import {WorldGenerationService} from "../../generation/world/service/world-generation.service";
import {ClockService} from "../../scheduling/service/clock.service";
import {LongTermSchedulingService} from "../../scheduling/service/long-term-scheduling.service";
import {ShortTermSchedulingService} from "../../scheduling/service/short-term-scheduling.service";

@Injectable({
	providedIn: 'root'
})
export class InitService {
	constructor(
		private worldGenerationService: WorldGenerationService,
		private clockService: ClockService,
		private longTermSchedulingService: LongTermSchedulingService,
		private shortTermSchedulingService: ShortTermSchedulingService,
	) {
	}
}
