import {GraphNode} from './GraphNode'
import {GraphEdge} from './GraphEdge'

/**
 * Graph data structure
 */
export class Graph<N_KEY, N, E_KEY, E> {

	/**
	 * Map of graph's nodes
	 */
	nodes: Map<N_KEY, GraphNode<N_KEY, N, E_KEY, E>>

	/**
	 * Initialize new graph
	 */
	constructor() {
		this.nodes = new Map<N_KEY, GraphNode<N_KEY, N, E_KEY, E>>()
	}

	/**
	 * Add new node
	 *
	 * @param key
	 * @param value
	 */
	addNode(key: N_KEY, value: N): void {
		this.nodes.set(key, new GraphNode<N_KEY, N, E_KEY, E>(key, value))
	}

	/**
	 * Get existing node by key
	 *
	 * @param key
	 */
	getNode(key: N_KEY): GraphNode<N_KEY, N, E_KEY, E> {
		const node = this.nodes.get(key)
		if (!node) throw Error('no node with such key')
		return node
	}

	/**
	 * Remove node by key.
	 * All its connections will be removed
	 *
	 * @param key
	 */
	removeNode(key: N_KEY): void {
		const node = this.getNode(key)

		node.adjacentNodes()
			.forEach(n => {
				n.edges = n.edges
					.filter(e => e.nodes
						.find(n => n.key === key)
					)
			})

		this.nodes.delete(key)
	}

	/**
	 * Connect two nodes and create edge between them.
	 * Loop nodes not allowed
	 *
	 * @param key1
	 * @param key2
	 * @param edgeKey
	 * @param edge
	 */
	connect(key1: N_KEY, key2: N_KEY, edgeKey: E_KEY, edge: E): void {
		if (key1 === key2) throw Error('loop nodes not allowed')

		const n1 = this.getNode(key1)
		const n2 = this.getNode(key2)
		const e = new GraphEdge(n1, n2, edgeKey, edge)
		n1.edges.push(e)
		n2.edges.push(e)
	}

	/**
	 * Disconnect two nodes and remove edge between them
	 *
	 * @param key1
	 * @param key2
	 */
	disconnect(key1: N_KEY, key2: N_KEY): void {
		[this.getNode(key1), this.getNode(key2)].forEach(n => {
			n.edges = n.edges
				.filter(e => e.nodes
					.filter(edgeNode => edgeNode.key !== n.key)
					.length === 0
				)
		})
	}

	/**
	 * Get string representation of a graph
	 */
	adjacencyList(): string {
		const lines = []
		this.nodes.forEach((v, k) => {
			const adjacentKeys = v.adjacentNodes().map(n => n.key)
			lines.push(`${k} -> ${adjacentKeys.length === 0 ? 'x' : adjacentKeys.join(', ')}`)
		})
		return lines.join('\n')
	}

}