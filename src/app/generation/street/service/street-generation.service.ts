import {Injectable} from '@angular/core';
import {StreetGenerationConfig} from "../config/StreetGenerationConfig";
import {Road} from "../Road";
import {RandomService} from "../../../random/service/random.service";
import {Range} from "../../../common/model/Range";

/**
 * Responsible for city street generation
 */
@Injectable({
	providedIn: 'root'
})
export class StreetGenerationService {

	/**
	 * Constructs service
	 */
	constructor(
		private randomService: RandomService,
	) {
	}

	/**
	 * Generate one city's streets
	 * @param config generation config
	 * @return list of generated roads
	 */
	generate(config: StreetGenerationConfig): Road[] {
		const mainRoad: Road = new Road(
			this.randomService,
			config.mainRoadCenterPosition,
			this.randomService.random(),
			config.mainRoadHorizontal
				? 0
				: this.randomService.randomRange(new Range(0, 2 * Math.PI)),
			this.randomService.randomRange(config.roadLength),
			config
		);
		const roads = mainRoad.generateIntersecting(
			this.randomService.randomRange(config.propagationSteps),
			[]
		);

		if (!config.totalRoadCount || config.totalRoadCount.in(roads.length)) {
			return roads;
		}
		this.generate(config);
	}

}
