import {Injectable} from '@angular/core'
import {RoadService} from './road.service'
import {Log} from '../../common/model/Log'
import {InteractionService} from '../../input/service/interaction.service'
import {first, pairwise} from 'rxjs/operators'
import {Position} from '../../common/model/Position'
import {Graph} from 'src/app/common/model/graph/Graph'
import {Tile} from '../model/Tile'
import {GraphEdge} from '../../common/model/graph/GraphEdge'
import {ObservableData} from '../../common/model/ObservableData'
import {zipAdjacent} from '../../common/util/zip-adjacent'
import {distinctAdjacent} from '../../common/util/distinct-adjacent'
import * as _ from 'lodash'
import {GraphNode} from '../../common/model/graph/GraphNode'

@Injectable({
	providedIn: 'root'
})
export class NavigationService {

	log: Log = new Log(this)

	currentRoute: ObservableData<Position[]> = new ObservableData<Position[]>()

	constructor(
		private roadService: RoadService,
		private interactionService: InteractionService
	) {
		this.interactionService.tileClick
			.pipe(pairwise())
			.subscribe(([from, to]) => {
				this.buildRoute(from, to, route => {
					this.currentRoute.set(route)
				})
			})
	}

	buildRoute(from: Position, to: Position, route: (route: Position[]) => void): void {
		this.roadService.roadNetwork.observable
			.pipe(first())
			.subscribe(roadNetwork => {
				if (!roadNetwork.hasNode(from)) throw new Error('start tile is not a road')
				if (!roadNetwork.hasNode(to)) throw new Error('destination tile is not a road')

				this.roadService.intersectionNetwork.observable
					.pipe(first())
					.subscribe(intersectionNetwork => {
						const [fromIntersection, fromPath] = this.findClosestIntersection(roadNetwork.getNode(from), to)
						const [toIntersection, toPath] = this.findClosestIntersection(roadNetwork.getNode(to), from)

						const intersectionRoute: Position[] = intersectionNetwork.aStar(
							fromIntersection.key,
							toIntersection.key,
							Position.distance,
							() => 1
						)
						route(
							distinctAdjacent([
								...fromPath.dfs(from, fromIntersection.key).map(n => n.key),
								...this.unwrapIntersectionRoute(intersectionNetwork, intersectionRoute),
								...toPath.dfs(toIntersection.key, to).map(n => n.key)
							])
						)
					})
			})
	}

	private findClosestIntersection(node: GraphNode<Position, Tile, void, void>, to: Position):
		[GraphNode<Position, Tile, void, void>, Graph<Position, Tile, void, void>] {
		return _.minBy(
			[
				this.roadService.traverseUntilIntersection(node, true),
				this.roadService.traverseUntilIntersection(node, false)
			],
			([intersectionNode,]) => Position.distance(intersectionNode.key, to)
		)
	}

	private unwrapIntersectionRoute(network: Graph<Position, Tile, void, Graph<Position, Tile, void, void>>, route: Position[]): Position[] {
		class RouteEdge {
			from: Position
			to: Position
			edge: GraphEdge<Position, Tile, void, Graph<Position, Tile, void, void>>

			constructor(from: Position, to: Position, edge: GraphEdge<Position, Tile, void, Graph<Position, Tile, void, void>>) {
				this.from = from
				this.to = to
				this.edge = edge
			}
		}

		const edges: RouteEdge[] = zipAdjacent(route)
			.map(([n1, n2]) => new RouteEdge(n1, n2, network.getEdgeBetween(n1, n2)))

		return edges.flatMap(e =>
			e.edge.value
				.dfs(e.from, e.to)
				.map(n => n.key)
		)
	}

}
