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
import {ChunkedCanvas} from '../../common/model/canvas/ChunkedCanvas'
import {SingleCanvas} from '../../common/model/canvas/SingleCanvas'
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

@Injectable({
	providedIn: 'root'
})
export class CommandEvaluationService {

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

	eval(command: string): any {
		return eval(`${command.replaceAll('$', 'this.')}`)
	}

}
