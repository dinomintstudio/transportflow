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
				this.log.debug('build road network')

				const network = new Graph<Position, Tile, void, void>()

				this.worldService.world.observable.subscribe(world => {
					tiles.forEach(tile => network.addNode(tile.position, tile))
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

				this.log.debug('road network complete')
				this.roadNetwork.set(network)
			})
	}

	/**
	 * Transform road network graph to intersection network graph.
	 * Intersection graph has each intersection and dead-end as a node (with a degree != 2).
	 * Edges are represented by an array of road tiles between the nodes.
	 *
	 * Algorithm is the following:
	 * 1. Construct a map of non-intersection roads (with a degree of 2)
	 * 2. Construct a map of intersection roads (with a degree other than 2)
	 * 3. Add all intersection roads to intersection graph
	 *  4.1 Pop any road from a map and traverse road network in two directions from this road
	 *   a. When a traversed road is an intersection, mark it as a destination, break traversing
	 *   b. When a traversed road is a non-intersection, add it to path and continue
	 *  4.2 Combine paths of two traversals together, plus initial road node
	 *  4.3 Remove roads if path from a map
	 * 5. Connect destination nodes with an edge with a path value
	 * 6. Until a map is empty, repeat from step 3
	 * 7. Check for intersections that are not in intersection graph. Add them, connecting to the adjacent nodes
	 */
	buildIntersectionNetwork<T>(): void {
		this.roadNetwork.observable
			.pipe(
				filter(n => !!n),
				first()
			)
			.subscribe(roadNetwork => {
				this.log.debug('build intersection network')

				const intersectionNetwork = new Graph<Position, Tile, void, Tile[]>()

				// 1
				const roadMap = new Map<Position, GraphNode<Position, Tile, void, void>>(
					[...roadNetwork.nodes.values()]
						.filter(node => node.edges.length === 2)
						.map(node => [node.value.position, node])
				)

				// 2
				const intersectionMap = new Map<Position, GraphNode<Position, Tile, void, void>>(
					[...roadNetwork.nodes.values()]
						.filter(node => node.edges.length !== 2)
						.map(node => [node.value.position, node])
				)

				// 3
				intersectionMap.forEach(node => {
					intersectionNetwork.addNode(node.key, node.value)
				})

				// 4.1
				while (roadMap.size !== 0) {
					const roadPosition = roadMap.keys().next().value
					roadMap.delete(roadPosition)

					const [leftIntersection, leftPath] = this.traverseUntilIntersection(roadNetwork.getNode(roadPosition), true)
					const [rightIntersection, rightPath] = this.traverseUntilIntersection(roadNetwork.getNode(roadPosition), false)

					// 4.2
					const path: Position[] = [...leftPath, roadPosition, ...rightPath]

					// 4.3
					path.forEach(r => {
						roadMap.delete(r)
					});

					// 4
					[leftIntersection, rightIntersection]
						.forEach(n => {
							try {
								intersectionMap.delete(n.key)
							} catch (e) {}
						})

					// 5
					intersectionNetwork.connect(
						leftIntersection.key,
						rightIntersection.key,
						undefined,
						path.map(p => roadNetwork.getNode(p).value)
					)
				}

				// 7
				intersectionMap.forEach(node => {
					node.adjacentNodes().forEach(adjacent => {
						if (intersectionNetwork.connected(node.key, adjacent.key)) return
						intersectionNetwork.connect(node.key, adjacent.key, undefined, [])
					})
				})

				this.log.debug('intersection network complete')
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
