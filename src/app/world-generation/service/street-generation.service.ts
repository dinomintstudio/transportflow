import {Injectable} from '@angular/core';
import {StreetGeneratorConfig} from "../model/StreetGeneratorConfig";
import {Road} from "../model/Road";
import {RandomService} from "../../random/service/random.service";
import {Range} from "../../common/model/Range";

// TODO: docs
@Injectable({
	providedIn: 'root'
})
export class StreetGenerationService {

	constructor(
		private randomService: RandomService,
	) {
	}

	generate(config: StreetGeneratorConfig): Road[] {
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
