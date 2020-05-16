import {GraphNode} from './GraphNode'

/**
 * Graph edge
 */
export class GraphEdge<N_KEY, N, E_KEY, E> {

	/**
	 * Edge key
	 */
	key: E_KEY

	/**
	 * Edge value.
	 * Can be void
	 */
	edge: E

	/**
	 * Nodes edge connects.
	 * List of size 2.
	 * Loop nodes not allowed
	 */
	nodes: GraphNode<N_KEY, N, E_KEY, E>[]

	private node1: GraphNode<N_KEY, N, E_KEY, E>
	private node2: GraphNode<N_KEY, N, E_KEY, E>

	/**
	 * Initialize edge
	 *
	 * @param node1
	 * @param node2
	 * @param key
	 * @param edge
	 */
	constructor(node1: GraphNode<N_KEY, N, E_KEY, E>, node2: GraphNode<N_KEY, N, E_KEY, E>, key: E_KEY, edge: E) {
		this.key = key
		this.edge = edge
		this.nodes = [node1, node2]
		this.node1 = node1
		this.node2 = node2
	}

}