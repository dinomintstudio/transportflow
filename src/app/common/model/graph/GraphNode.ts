import {GraphEdge} from './GraphEdge'

/**
 * Graph node
 */
export class GraphNode<N_KEY, N, E_KEY, E> {

	/**
	 * Node key
	 */
	key: N_KEY

	/**
	 * Node value.
	 * Can be void
	 */
	value: N

	/**
	 * List of edges, connected to current node
	 */
	edges: GraphEdge<N_KEY, N, E_KEY, E>[]

	/**
	 * Initialize node
	 * @param key
	 * @param value
	 */
	constructor(key: N_KEY, value: N) {
		this.key = key
		this.value = value
		this.edges = []
	}

	/**
	 * Get adjacent nodes - nodes that have common edges with current node
	 */
	adjacentNodes(): GraphNode<N_KEY, N, E_KEY, E>[] {
		return this.edges
			.map(e => e.nodes
				.find(n => n.key != this.key)
			)
	}

}