import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {World} from "../model/World";
import {TiledTerrain} from "../../generation/terrain/model/TiledTerrain";
import {TiledCity} from "../../generation/city/model/TiledCity";
import {WorldGenerationConfig} from "../../generation/world/config/WorldGenerationConfig";
import {Tile} from "../model/Tile";
import {Maybe} from "../../common/model/Maybe";
import {City} from "../model/City";

@Injectable({
	providedIn: 'root'
})
export class WorldService {

	world: ObservableData<World> = new ObservableData<World>();

	constructor() {
	}

	merge(tiledTerrain: TiledTerrain, tiledCity: TiledCity, config: WorldGenerationConfig): World {
		return new World(
			this.mergeTilemap(tiledTerrain, tiledCity),
			config
		);
	}

	private mergeTilemap(tiledTerrain: TiledTerrain, tiledCity: TiledCity) {
		return tiledTerrain.tilemap.map(e => new Tile(
			e.surface,
			e.biome,
			e.isPlant,
			new Maybe<City>(e.isCity ? new City() : null),
			Maybe.empty(),
			Maybe.empty()
		));
	}

}
