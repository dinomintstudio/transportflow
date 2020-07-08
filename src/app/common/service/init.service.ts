import {Injectable} from '@angular/core'
import {WorldGenerationService} from '../../generation/world/service/world-generation.service'
import {ClockService} from '../../scheduling/service/clock.service'
import {LongTermSchedulingService} from '../../scheduling/service/long-term-scheduling.service'
import {ShortTermSchedulingService} from '../../scheduling/service/short-term-scheduling.service'
import {KeyService} from '../../input/service/key.service'
import {MouseService} from '../../input/service/mouse.service'
import {ConfigService} from './config.service'

/**
 * Bootstrap service, used to start services that need to work from the application launch
 */
@Injectable({
	providedIn: 'root'
})
export class InitService {
	constructor(
		private worldGenerationService: WorldGenerationService,
		private clockService: ClockService,
		private longTermSchedulingService: LongTermSchedulingService,
		private shortTermSchedulingService: ShortTermSchedulingService,
		private keyService: KeyService,
		private mouseService: MouseService,
		private configService: ConfigService
	) {}
}
