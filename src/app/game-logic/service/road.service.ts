import {Injectable} from '@angular/core'
import {WorldService} from './world.service'
import {filter, first, map} from 'rxjs/operators'
import {Observable} from 'rxjs'
import {Tile} from '../model/Tile'
import {Log} from '../../common/model/Log'
import {Graph} from '../../common/model/graph/Graph'
import {Position} from '../../common/model/Position'
import {ObservableData} from '../../common/model/ObservableData'
import {Maybe} from '../../common/model/Maybe'
import {Matrix} from '../../common/model/Matrix'
import * as _ from 'lodash'
import {GraphNode} from '../../common/model/graph/GraphNode'

@Injectable({
	providedIn: 'root'
})
export class RoadService {

	log: Log = new Log(this)

	roadTiles: Observable<Tile[]>
	roadNetwork: ObservableData<Graph<Position, Tile, void, void>> = new ObservableData<Graph<Position, Tile, void, void>>()
	intersectionNetwork: ObservableData<Graph<Position, Tile, void, Tile[]>> = new ObservableData<Graph<Position, Tile, void, Tile[]>>()

	constructor(
		private worldService: WorldService
	) {
		this.roadTiles = worldService.world.observable
			.pipe(
				map(world => world.tilemap
					.flatMap()
					.filter(tile => tile.road.isPresent())
				)
			)

		this.buildRoadNetwork()
		this.buildIntersectionNetwork()
	}

	buildRoadNetwork<T>(): void {
		this.roadTiles
			.pipe(first())
			.subscribe(tiles => {
				const network = new Graph<Position, Tile, void, void>()

				this.worldService.world.observable.subscribe(world => {
					tiles.forEach(tile => {
						network.addNode(tile.position, tile)
						const adjacentTiles: Matrix<Maybe<Tile>> = this.worldService.getAdjacentTileMatrix(world.tilemap, tile.position)
					})
					tiles.forEach(tile => {
						const nearTiles: Maybe<Tile>[] = this.worldService
							.getAdjacentTileMatrix(world.tilemap, tile.position)
							.flatMap()
						const adjacentTiles: Maybe<Tile>[] = [
							nearTiles[1],
							nearTiles[3],
							nearTiles[5],
							nearTiles[7]
						]
						const adjacentRoads = adjacentTiles
							.filter(t => t.isPresent())
							.map(t => t.get())
							.filter(t => t.road.isPresent())
							.filter(t => !_.isEqual(t.position, tile.position))
						adjacentRoads.forEach(adjacentRoad => {
								if (!network.connected(tile.position, adjacentRoad.position)) {
									network.connect(tile.position, adjacentRoad.position)
								}
							}
						)
					})
				})

				this.roadNetwork.set(network)
			})
	}

	/**
	 * Transform road network graph to intersection network graph.
	 * Intersection graph has each intersection and dead-end as a node (with a degree != 2).
	 * Edges are represented by an array of road tiles between the nodes.
	 * Algorithm is the following:
	 *  1. Construct a map of non-intersection roads (with a degree of 2)
	 *  2. Create a buffer for traversed non-intersection roads
	 *  3. Pop random road from a map and traverse road network in two directions
	 *   a. When a traversed road is an intersection, mark it as a destination, break traversing
	 *   b. When a traversed road is a non-intersection, add it to buffer and continue
	 *  3.1 Remove traversed roads from a map
	 *  4. Add (if not present) 2 destination nodes to the intersection graph and connect them with an edge with a
	 *  buffer value
	 *  5. Clear buffer
	 *  6. Until a map is empty, repeat from step 3
	 *  7. Check for intersections that are not in intersection graph. Add them, they have no connections
	 *
	 *  TODO: handle the case of two adjacent dead-ends. They will be added disconnected
	 */
	buildIntersectionNetwork<T>(): void {
		this.roadNetwork.observable
			.pipe(
				filter(n => !!n),
				first()
			)
			.subscribe(roadNetwork => {
				const intersectionNetwork = new Graph<Position, Tile, void, Tile[]>()

				// 1
				const map = new Map<Position, GraphNode<Position, Tile, void, void>>(
					[...roadNetwork.nodes.values()]
						.filter(node => node.edges.length === 2)
						.map(node => [node.value.position, node])
				)

				// 2, 3
				while (map.size !== 0) {
					const roadPosition = map.keys().next().value
					map.delete(roadPosition)

					const [leftIntersection, leftPath] = this.traverseUntilIntersection(roadNetwork.getNode(roadPosition), true)
					const [rightIntersection, rightPath] = this.traverseUntilIntersection(roadNetwork.getNode(roadPosition), false)

					const path: Position[] = [...leftPath, roadPosition, ...rightPath]

					// 3.1
					path.forEach(r => {
						map.delete(r)
					});

					// 4
					[leftIntersection, rightIntersection]
						.forEach(n => {
							try {
								intersectionNetwork.addNode(n.key, n.value)
							} catch (e) {}
						})
					intersectionNetwork.connect(
						leftIntersection.key,
						rightIntersection.key,
						undefined,
						path.map(p => roadNetwork.getNode(p).value)
					)
				}

				this.log.info(intersectionNetwork.adjacencyList())
				this.intersectionNetwork.set(intersectionNetwork)
			})
	}

	private traverseUntilIntersection(
		node: GraphNode<Position, Tile, void, void>,
		traverseFirst: boolean,
		path = [],
		prevNode = undefined
	): [GraphNode<Position, Tile, void, void>, Position[]] {
		if (traverseFirst !== undefined) {
			// first pick based on `traverseFirst`. If value is true, pick index 0 edge to traverse; index 1 otherwise
			return this.traverseUntilIntersection(
				node.adjacentNodes()[traverseFirst ? 0 : 1],
				undefined,
				[],
				node
			)
		}
		if (prevNode) {
			// check if current node is intersection
			if (node.edges.length !== 2) {
				return [node, path]
			} else {
				// add current node to path
				path.push(node.key)

				// continue traverse with node other than previous
				const next = node.adjacentNodes()
					.filter(n => !_.isEqual(n.key, prevNode.key))[0]
				return this.traverseUntilIntersection(next, undefined, path, node)
			}
		}
	}

}
