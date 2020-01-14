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
import {Building} from "../../../game-logic/model/Building";
import {GeneratedCityTemplate} from "../model/GeneratedCityTemplate";
import {IndexedCityTile} from "../model/IndexedCityTile";

import _ from 'lodash'
import {BuildingImpl} from "../model/BuildingImpl";
import {GeneratedBuilding} from "../model/GeneratedBuilding";

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

		console.table(cityTilemap.map(e => e.isPresent() && e.get().type ? e.get().type : "").value);

		const buildings: Building[] = this.mergeBuildingBlocks(cityTilemap);
		return new TiledCity(
			new GeneratedCityTemplate(
				roads,
				buildings
			),
			cityTilemap
		);
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

	private neighbourSubmatrix<T>(matrix: Matrix<T>, position: Position, radius: number): Matrix<T> {
		return matrix.of(
			Rectangle.rectangleByOnePoint(
				new Position(
					position.x - radius,
					position.y - radius
				),
				Shape.square(2 * radius + 1)
			),
			null
		);
	}

	private placeBuildingBlocks(tilemap: Matrix<Maybe<CityTile>>, config: CityGenerationConfig): void {
		tilemap.forEach((e, p) => {
			if (e
				.filter(t => t.type === 'road')
				.isPresent()) return;

			const neighboursSubmatrix = this.neighbourSubmatrix(tilemap, p, config.closestRoadDistance);

			let hasNeighbourRoad = neighboursSubmatrix
				.flatMap()
				.filter(e => e)
				.filter(e => e.isPresent())
				.map(e => e.get())
				.filter(e => e.type === 'road').length > 0;

			if (hasNeighbourRoad && this.randomService.withProbability(config.buildingBlockAppearanceProbability)) {
				tilemap.set(p, new Maybe(new CityTile('building')));
			}
		});
	}

	private mergeBuildingBlocks(tilemap: Matrix<Maybe<CityTile>>): Building[] {
		const resultBuildings: Building[] = [];

		const indexedTilemap: Matrix<IndexedCityTile> = tilemap.map((e, p) => {
			return new IndexedCityTile(p, e);
		});

		const usedBuildingBlocks = new Matrix<Boolean>(indexedTilemap.shape, null, false);

		indexedTilemap.forEach(indexedTile => {
			if (!indexedTile.tile.isPresent() || indexedTile.tile.get().type !== 'building') return;
			if (usedBuildingBlocks.at(indexedTile.position)) return;

			let neighboursMatrix = this.neighbourSubmatrix(indexedTilemap, indexedTile.position, 1);

			const buildingAreas: Matrix<IndexedCityTile>[] = [];
			_.range(4).forEach(() => {
				let buildingArea: Matrix<IndexedCityTile> = neighboursMatrix.of(
					Rectangle.rectangleByOnePoint(
						new Position(0, 0),
						new Shape(2, 2)
					)
				);

				buildingAreas.push(buildingArea);
				neighboursMatrix = neighboursMatrix.rotateClockwise()
			});

			const generatedBuildings: GeneratedBuilding[] = buildingAreas.map(area => this.buildingByBuildingArea(area, usedBuildingBlocks));
			const generatedBuilding = generatedBuildings
				.sort((b1, b2) => b2.building.position.shape.width - b1.building.position.shape.width ||
					b2.building.position.shape.height - b1.building.position.shape.height)[0];
			resultBuildings.push(generatedBuilding.building);
			generatedBuilding.tiles.forEach(t => {
				usedBuildingBlocks.set(t.position, true);
			});
		});

		return resultBuildings;
	}

	// TODO: refactor
	private buildingByBuildingArea(area: Matrix<IndexedCityTile>, usedBuildingBlock: Matrix<Boolean>): GeneratedBuilding {
		const topLeft: IndexedCityTile = area.at(new Position(0, 0));
		const topRight: IndexedCityTile = area.at(new Position(1, 0));
		const bottomLeft: IndexedCityTile = area.at(new Position(0, 1));
		const bottomRight: IndexedCityTile = area.at(new Position(1, 1));

		const mergedTiles: IndexedCityTile[] = [bottomRight];

		const isAvailableTile = (t: IndexedCityTile): Boolean => {
			return t !== null && t.tile.isPresent() && t.tile.get().type == 'building' && !usedBuildingBlock.at(t.position);
		};

		if (isAvailableTile(bottomLeft) || isAvailableTile(topRight)) {
			if (isAvailableTile(bottomLeft) && isAvailableTile(topRight)) {
				if (isAvailableTile(topLeft)) {
					mergedTiles.push(topLeft, topRight, bottomLeft);
				} else {
					if (this.randomService.withProbability(0.5)) {
						mergedTiles.push(bottomLeft);
					} else {
						mergedTiles.push(topRight);
					}
				}
			} else {
				if (isAvailableTile(bottomLeft)) {
					mergedTiles.push(bottomLeft)
				}

				if (isAvailableTile(topRight)) {
					mergedTiles.push(topRight)
				}
			}
		}

		return new GeneratedBuilding(
			this.mergedTilesToBuilding(mergedTiles),
			mergedTiles
		);
	}

	private mergedTilesToBuilding(tiles: IndexedCityTile[]): Building {
		const topLeft: IndexedCityTile = tiles
			.sort((t1, t2) => t1.position.x - t2.position.x || t1.position.y - t2.position.y)[0];
		const bottomRight: IndexedCityTile = tiles
			.sort((t1, t2) => t1.position.x - t2.position.x || t1.position.y - t2.position.y)
			.reverse()[0];

		return new BuildingImpl(Rectangle.rectangleByTwoPoints(topLeft.position, bottomRight.position));
	}

}
