import {Injectable} from '@angular/core'
import {WorldService} from './world.service'
import {first, map} from 'rxjs/operators'
import {Observable} from 'rxjs'
import {Tile} from '../model/Tile'
import {Log} from '../../common/model/Log'
import {Graph} from '../../common/model/graph/Graph'
import {Position} from '../../common/model/Position'
import {ObservableData} from '../../common/model/ObservableData'
import {Maybe} from '../../common/model/Maybe'
import {Matrix} from '../../common/model/Matrix'
import * as _ from 'lodash'

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
		// this.buildIntersectionNetwork()
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
				console.log(network.nodes.values())
				this.log.info(network.adjacencyList())
			})
	}

	// buildIntersectionNetwork<T>(): void {
	// 	this.roadNetwork.observable
	// 		.pipe(
	// 			filter(n => !!n),
	// 			first()
	// 		)
	// 		.subscribe(tiles => {
	// 			const network = new Graph<Position, Tile, void, Tile[]>()
	//
	// 			this.log.info(network.adjacencyList())
	// 		})
	// }

}
