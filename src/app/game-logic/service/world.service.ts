import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {World} from "../model/World";
import {TiledTerrain} from "../../generation/terrain/model/TiledTerrain";
import {WorldGenerationConfig} from "../../generation/world/config/WorldGenerationConfig";
import {Tile} from "../model/Tile";
import {Maybe} from "../../common/model/Maybe";
import {CityGenerationService} from "../../generation/city/service/city-generation.service";

@Injectable({
	providedIn: 'root'
})
export class WorldService {

	world: ObservableData<World> = new ObservableData<World>();

	constructor(
		private cityGenerationService: CityGenerationService
	) {
	}

	generate(tiledTerrain: TiledTerrain, config: WorldGenerationConfig): World {
		console.debug('generate world');
		const tilemap = tiledTerrain.tilemap
			.map(terrainTile => new Tile(
				terrainTile.surface,
				terrainTile.biome,
				terrainTile.isPlant,
				Maybe.empty(),
				Maybe.empty(),
				Maybe.empty()
			));

		// tiledTerrain.cityPoints.forEach(cityPoint => {
		// 	const city = this.cityGenerationService.generate(config.cityGenerationConfig);
		// 	city.generatedCityTemplate.buildings.forEach((building) => {
		// 			const worldTile = tilemap.at(building.position.topLeft);
		// 			tilemap.set(
		// 				tilePosition,
		// 				new Tile(
		// 					worldTile.surface,
		// 					worldTile.biome,
		// 					worldTile.isPlant,
		// 					new Maybe<TiledCity>(city),
		// 					new Maybe<Building>(cityTile.get().type === 'building' ? new House(tilePosition) : null),
		// 					new Maybe<RoadTile>(cityTile.get().type === 'building' ? new RoadTile(
		//
		// 					) : null)
		// 				)
		// 			)
		// 		});
		// });

		return new World(
			tilemap,
			config
		)
	}

}
