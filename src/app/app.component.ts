import {Component} from '@angular/core';
import {InitService} from "./common/service/init.service";
import {TerrainGenerationService} from "./generation/terrain/service/terrain-generation.service";
import {TerrainGenerationConfig} from "./generation/terrain/config/TerrainGenerationConfig";
import {Shape} from "./common/model/Shape";
import {AltitudeMapConfig} from "./generation/terrain/config/noisemap/AltitudeMapConfig";
import {NoiseConfig} from "./util/config/NoiseConfig";
import {TemperatureMapConfig} from "./generation/terrain/config/noisemap/TemperatureMapConfig";
import {HumidityMapConfig} from "./generation/terrain/config/noisemap/HumidityMapConfig";
import {BiomesConfig} from "./generation/terrain/config/biome/BiomesConfig";
import {StreetGenerationService} from "./generation/street/service/street-generation.service";
import {StreetGenerationConfig} from "./generation/street/config/StreetGenerationConfig";
import {Range} from "./common/model/Range";
import {RandomService} from "./util/service/random.service";
import {CityGenerationConfig} from "./generation/city/config/CityGenerationConfig";
import {CityGenerationService} from "./generation/city/service/city-generation.service";
import {RenderService} from "./render/service/render.service";
import {WorldService} from "./game-logic/service/world.service";
import {WorldGenerationConfig} from "./generation/world/config/WorldGenerationConfig";
import {DesertBiomeConfig} from "./generation/terrain/config/biome/DesertBiomeConfig";
import {TaigaBiomeConfig} from "./generation/terrain/config/biome/TaigaBiomeConfig";
import {JungleBiomeConfig} from "./generation/terrain/config/biome/JungleBiomeConfig";
import {Log} from "./common/model/Log";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	log: Log = new Log(this);

	constructor(
		private initService: InitService,
		private terrainGenerationService: TerrainGenerationService,
		private streetGenerationService: StreetGenerationService,
		private randomService: RandomService,
		private cityGenerationService: CityGenerationService,
		private renderService: RenderService,
		private worldService: WorldService
	) {
		const terrainGenerationConfig = new TerrainGenerationConfig(
			new Shape(512, 512),
			0.002,
			new AltitudeMapConfig(
				new NoiseConfig(
					0.015
				),
				4,
				5,
				2
			),
			new TemperatureMapConfig(
				new NoiseConfig(
					0.001
				),
				4,
				1
			),
			new HumidityMapConfig(
				new NoiseConfig(
					0.01
				),
				9,
				0,
				0
			),
			new BiomesConfig(
				new DesertBiomeConfig(
					0.2
				),
				new TaigaBiomeConfig(
					0.75
				),
				new JungleBiomeConfig(
					0.9
				)
			),
			new NoiseConfig(
				0.03,
				new Range(0, 1)
			),
			0.1,
			0.06
		);

		let tiledTerrain = this.terrainGenerationService.generate(
			terrainGenerationConfig
		);

		const config: StreetGenerationConfig = new StreetGenerationConfig(
			new Range(2, 12),
			new Range(3, 4),
			2,
			new Range(1, 2)
		);

		const cityGenerationConfig = new CityGenerationConfig(
			2,
			0.6,
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
		);
	}

}
