import {Injectable} from '@angular/core'
import {RenderService} from '../../render/service/render.service'
import {ConfigService} from '../../common/service/config.service'
import {InitService} from '../../common/service/init.service'
import {RandomService} from '../../common/service/random.service'
import {WorldService} from '../../game-logic/service/world.service'
import {CityGenerationService} from '../../generation/city/service/city-generation.service'
import {StreetGenerationService} from '../../generation/street/service/street-generation.service'
import {TerrainGenerationService} from '../../generation/terrain/service/terrain-generation.service'
import {WorldGenerationService} from '../../generation/world/service/world-generation.service'
import {InteractionService} from '../../input/service/interaction.service'
import {KeyService} from '../../input/service/key.service'
import {MouseService} from '../../input/service/mouse.service'
import {CameraService} from '../../render/service/camera.service'
import {RenderProfileService} from '../../render/service/render-profile.service'
import {SpriteService} from '../../render/service/sprite.service'
import {SpriteRenderService} from '../../render/service/sprite-render.service'
import {ClockService} from '../../scheduling/service/clock.service'
import {LongTermSchedulingService} from '../../scheduling/service/long-term-scheduling.service'
import {ShortTermSchedulingService} from '../../scheduling/service/short-term-scheduling.service'
import {ChunkedCanvas} from '../../render/model/canvas/ChunkedCanvas'
import {SingleCanvas} from '../../render/model/canvas/SingleCanvas'
import {Graph} from '../../common/model/graph/Graph'
import {GraphEdge} from '../../common/model/graph/GraphEdge'
import {GraphNode} from '../../common/model/graph/GraphNode'
import {Matrix} from '../../common/model/Matrix'
import {Maybe} from '../../common/model/Maybe'
import {ObservableData} from '../../common/model/ObservableData'
import {Position} from '../../common/model/Position'
import {Range} from '../../common/model/Range'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'
import {Biome} from '../../game-logic/model/Biome'
import {City} from '../../game-logic/model/City'
import {CityPlan} from '../../game-logic/model/CityPlan'
import {Road} from '../../game-logic/model/Road'
import {RoadTile} from '../../game-logic/model/RoadTile'
import {Surface} from '../../game-logic/model/Surface'
import {Tile} from '../../game-logic/model/Tile'
import {World} from '../../game-logic/model/World'
import {Camera} from 'src/app/render/model/Camera'
import {SpriteRenderer} from 'src/app/render/model/SpriteRenderer'

/**
 * Responsible for providing evaluation of arbitrary string commands within application context with available services
 * and models
 * TODO: investigate better evaluation solutions
 */
@Injectable({
	providedIn: 'root'
})
export class CommandEvaluationService {

	// common
	private ChunkedCanvas = ChunkedCanvas
	private SingleCanvas = SingleCanvas
	private Graph = Graph
	private GraphEdge = GraphEdge
	private GraphNode = GraphNode
	private Matrix = Matrix
	private Maybe = Maybe
	private ObservableData = ObservableData
	private Position = Position
	private Range = Range
	private Rectangle = Rectangle
	private Shape = Shape

	// game-logic
	private Biome = Biome
	private City = City
	private CityPlan = CityPlan
	private Road = Road
	private RoadTile = RoadTile
	private Surface = Surface
	private Tile = Tile
	private World = World

	// render
	private Camera = Camera
	private SpriteRenderer = SpriteRenderer

	constructor(
		private configService: ConfigService,
		private initService: InitService,
		private randomService: RandomService,
		private worldService: WorldService,
		private cityGenerationService: CityGenerationService,
		private streetGenerationService: StreetGenerationService,
		private terrainGenerationService: TerrainGenerationService,
		private worldGenerationService: WorldGenerationService,
		private interactionService: InteractionService,
		private keyService: KeyService,
		private mouseService: MouseService,
		private cameraService: CameraService,
		private renderService: RenderService,
		private renderProfileService: RenderProfileService,
		private spriteService: SpriteService,
		private spriteRenderService: SpriteRenderService,
		private clockService: ClockService,
		private longTermSchedulingService: LongTermSchedulingService,
		private shortTermSchedulingService: ShortTermSchedulingService,
	) {}

	/**
	 * Evaluate arbitrary string command within application context and return the result
	 * @param command
	 */
	eval(command: string): any {
		return eval(command.replace(new RegExp('\\$'), 'this.'))
	}

}
