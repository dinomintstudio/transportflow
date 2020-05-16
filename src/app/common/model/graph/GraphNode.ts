import {GraphEdge} from './GraphEdge'
import {Maybe} from '../Maybe'

/**
 * Graph node
 */
export class GraphNode<NK, N, EK, E> {

	/**
	 * Node key
	 */
	key: NK

	/**
	 * Node value.
	 * Can be void
	 */
	value: N

	/**
	 * List of edges, connected to current node
	 */
	edges: GraphEdge<NK, N, EK, E>[]

	/**
	 * Initialize node
	 * @param key
	 * @param value
	 */
	constructor(key: NK, value: N) {
		this.key = key
		this.value = value
		this.edges = []
	}

	/**
	 * Get adjacent nodes - nodes that have common edges with current node
	 */
	adjacentNodes(): GraphNode<NK, N, EK, E>[] {
		return this.edges
			.map(e => e.nodes
				.find(n => n.key != this.key)
			)
	}

	/**
	 * Return edge between neighbor and current node
	 * @param neighborKey
	 */
	edgeWith(neighborKey: NK): Maybe<GraphEdge<NK, N, EK, E>> {
		return new Maybe(this.edges.find(e => !!e.nodes.find(n => n.key === neighborKey)))
	}

}