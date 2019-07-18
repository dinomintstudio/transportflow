import {Injectable} from '@angular/core';
import {CityGenerationConfig} from "../config/CityGenerationConfig";
import {TiledCity} from "../model/TiledCity";
import {StreetGenerationService} from "../../street/service/street-generation.service";
import {Road} from "../../street/model/Road";
import {Matrix} from "../../../common/model/Matrix";
import {Shape} from "../../../common/model/Shape";
import {Position} from "../../../common/model/Position";
import {Maybe} from "../../../common/model/Maybe";
import {CityTile} from "../model/CityTile";
import {Rectangle} from "../../../common/model/Rectangle";
import {RandomService} from "../../../random/service/random.service";

@Injectable({
	providedIn: 'root'
})
export class CityGenerationService {

	constructor(
		private streetGenerationService: StreetGenerationService,
		private randomService: RandomService
	) {
	}

	generate(config: CityGenerationConfig): TiledCity {
		const roads: Road[] = this.streetGenerationService.generate(config.streetGenerationConfig);

		const tilemap: Matrix<Boolean> = this.streetGenerationService.toTilemap(roads);

		const extendedTilemap = this.extendRoadTilemap(tilemap, config.closestRoadDistance);
		let cityTilemap: Matrix<Maybe<CityTile>> = this.roadTilemapToCityTilemap(extendedTilemap);
		this.placeBuildingBlocks(cityTilemap, config);

		console.table(cityTilemap.map(v => v.isPresent() ? v.get().type : '').value);

		return null;
	}

	private extendRoadTilemap(tilemap: Matrix<Boolean>, closestRoadDistance: number): Matrix<Boolean> {
		const extendedTilemap = new Matrix<Boolean>(
			new Shape(
				tilemap.shape.width + 2 * closestRoadDistance,
				tilemap.shape.height + 2 * closestRoadDistance
			),
			[],
			false
		);
		extendedTilemap.insert(
			new Position(
				closestRoadDistance,
				closestRoadDistance
			),
			tilemap
		);

		return extendedTilemap;
	}

	private roadTilemapToCityTilemap(tilemap: Matrix<Boolean>): Matrix<Maybe<CityTile>> {
		return tilemap.map(t => t ? new Maybe(new CityTile('road')) : Maybe.empty());
	}

	private placeBuildingBlocks(tilemap: Matrix<Maybe<CityTile>>, config: CityGenerationConfig): void {
		tilemap.forEach((e, i, j) => {
			if (e
				.filter(t => t.type === 'road')
				.isPresent()) return;

			const neighboursSubmatrix = tilemap.of(
				Rectangle.rectangleByOnePoint(
					new Position(
						j - config.closestRoadDistance,
						i - config.closestRoadDistance
					),
					new Shape(
						2 * config.closestRoadDistance + 1,
						2 * config.closestRoadDistance + 1
					)
				),
				Maybe.empty()
			);

			let hasNeighbourRoad = neighboursSubmatrix.value
				.flatMap(e => e)
				.filter(e => e.isPresent())
				.map(e => e.get())
				.filter(e => e.type == 'road').length > 0;

			if (hasNeighbourRoad && this.randomService.withProbability(config.buildingBlockAppearanceProbability)) {
				tilemap.set(new Position(j, i), new Maybe(new CityTile('building')));
			}
		});
	}

}
