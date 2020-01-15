import {Component} from '@angular/core';
import {InitService} from "./common/service/init.service";
import {TerrainGenerationService} from "./generation/terrain/service/terrain-generation.service";
import {TerrainGenerationConfig} from "./generation/terrain/config/TerrainGenerationConfig";
import {Shape} from "./common/model/Shape";
import {AltitudeMapConfig} from "./generation/terrain/config/noisemap/AltitudeMapConfig";
import {NoiseConfig} from "./math/config/NoiseConfig";
import {TemperatureMapConfig} from "./generation/terrain/config/noisemap/TemperatureMapConfig";
import {HumidityMapConfig} from "./generation/terrain/config/noisemap/HumidityMapConfig";
import {BiomesConfig} from "./generation/terrain/config/biome/BiomesConfig";
import {LoggingService} from "./common/service/logging.service";
import {StreetGenerationService} from "./generation/street/service/street-generation.service";
import {StreetGenerationConfig} from "./generation/street/config/StreetGenerationConfig";
import {Range} from "./common/model/Range";
import {Road} from "./generation/street/model/Road";
import {RandomService} from "./random/service/random.service";
import {CityGenerationConfig} from "./generation/city/config/CityGenerationConfig";
import {CityGenerationService} from "./generation/city/service/city-generation.service";
import {RenderService} from "./visualization/service/render.service";
import {WorldService} from "./game-logic/service/world.service";
import {WorldGenerationConfig} from "./generation/world/config/WorldGenerationConfig";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(
		private initService: InitService,
		private terrainGenerationService: TerrainGenerationService,
		private streetGenerationService: StreetGenerationService,
		private log: LoggingService,
		private randomService: RandomService,
		private cityGenerationService: CityGenerationService,
		private renderService: RenderService,
		private worldService: WorldService
	) {
		const terrainGenerationConfig = new TerrainGenerationConfig(
			Shape.square(128),
			0.001,
			0.25,
			new AltitudeMapConfig(
				new NoiseConfig(
					0.03
				),
				6,
				3,
				1
			),
			new TemperatureMapConfig(
				new NoiseConfig(
					0.005
				),
				3,
				1
			),
			new HumidityMapConfig(
				new NoiseConfig(
					0.005
				),
				4,
				2,
				1
			),
			new BiomesConfig()
		);

		let tiledTerrain = this.terrainGenerationService.generate(
			terrainGenerationConfig
		);

		const config: StreetGenerationConfig = new StreetGenerationConfig(
			new Range(4, 12),
			new Range(2, 4),
			2,
			new Range(2, 3)
		);

		let roads: Road[] = this.streetGenerationService.generate(config);
		let tilemap = this.streetGenerationService.toTilemap(roads);

		const cityGenerationConfig = new CityGenerationConfig(
			2,
			0.5,
			config
		);

		this.worldService.world.set(
			this.worldService.generate(
				tiledTerrain,
				new WorldGenerationConfig(
					terrainGenerationConfig,
					cityGenerationConfig
				)
			)
		)
	}

}
