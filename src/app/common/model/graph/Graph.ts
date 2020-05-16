import {GraphNode} from './GraphNode'
import {GraphEdge} from './GraphEdge'

/**
 * Graph data structure
 *
 * @param NK node key type
 * @param N node type
 * @param EK edge key type
 * @param E edge type
 */
export class Graph<NK, N, EK, E> {

	/**
	 * Map of graph's nodes
	 */
	nodes: Map<NK, GraphNode<NK, N, EK, E>>

	/**
	 * Initialize new graph
	 */
	constructor(nodes?: GraphNode<NK, N, EK, E>[]) {
		this.nodes = nodes
			? new Map<NK, GraphNode<NK, N, EK, E>>(nodes.map(n => [n.key, n]))
			: new Map<NK, GraphNode<NK, N, EK, E>>()
	}

	/**
	 * Add new node
	 *
	 * @param key
	 * @param value
	 */
	addNode(key: NK, value: N): void {
		this.nodes.set(key, new GraphNode<NK, N, EK, E>(key, value))
	}

	/**
	 * Get existing node by key
	 *
	 * @param key
	 */
	getNode(key: NK): GraphNode<NK, N, EK, E> {
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
	removeNode(key: NK): void {
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
	connect(key1: NK, key2: NK, edgeKey: EK, edge: E): void {
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
	disconnect(key1: NK, key2: NK): void {
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

	/**
	 * Split graph into connected components
	 */
	getComponents(): Graph<NK, N, EK, E>[] {
		let unvisitedNodes = [...this.nodes.values()]
		const components: Graph<NK, N, EK, E>[] = []

		while (unvisitedNodes.length !== 0) {
			const node = unvisitedNodes.shift()
			const connected = this.bfs(node.key)
			components.push(new Graph(connected))
			unvisitedNodes = unvisitedNodes.filter(un => !connected.includes(un))
		}

		return components
	}

	/**
	 * Breadth first search graph traversal
	 *
	 * @param startNodeKey
	 * @param endNodeKey
	 */
	bfs(startNodeKey?: NK, endNodeKey?: NK): GraphNode<NK, N, EK, E>[] {
		if (this.nodes.size === 0) return []
		if (!startNodeKey) {
			startNodeKey = this.nodes.keys().next().value
		}

		return this.bfsUtil(this.getNode(startNodeKey), endNodeKey, [])
	}

	/**
	 * Depth first search graph traversal
	 *
	 * @param startNodeKey
	 * @param endNodeKey
	 */
	dfs(startNodeKey?: NK, endNodeKey?: NK): GraphNode<NK, N, EK, E>[] {
		if (this.nodes.size === 0) return []
		if (!startNodeKey) {
			startNodeKey = this.nodes.keys().next().value
		}

		return [...new Set(this.dfsUtil(this.getNode(startNodeKey), endNodeKey, []))]
	}

	private bfsUtil(node: GraphNode<NK, N, EK, E>, endNodeKey: NK, visitedNodes: GraphNode<NK, N, EK, E>[]): GraphNode<NK, N, EK, E>[] {
		const queue: GraphNode<NK, N, EK, E>[] = [node]

		visitedNodes.push(node)
		while (queue.length !== 0) {
			const v = queue.shift()

			if (v.key === endNodeKey) return visitedNodes.concat(v)

			v.adjacentNodes()
				.forEach(n => {
					if (visitedNodes.find(v => v.key === n.key)) return
					queue.push(n)
					visitedNodes.push(n)
				})
		}

		return visitedNodes
	}

	private dfsUtil(node: GraphNode<NK, N, EK, E>, endNodeKey: NK, visitedNodes: GraphNode<NK, N, EK, E>[]): GraphNode<NK, N, EK, E>[] {
		visitedNodes.push(node)
		node.adjacentNodes().forEach(n => {
			if (visitedNodes.find(v => v.key === n.key)) return
			if (n.key === endNodeKey) {
				visitedNodes.push(n)
				return
			}
			this.dfsUtil(n, endNodeKey, visitedNodes)
		})
		return visitedNodes
	}

}
