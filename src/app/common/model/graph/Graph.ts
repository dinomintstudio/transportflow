import {GraphNode} from './GraphNode'
import {GraphEdge} from './GraphEdge'
import * as _ from 'lodash'

/**
 * Undirected graph data structure
 *
 * @param NK node key type
 * @param N node type
 * @param EK value key type
 * @param E value type
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
	 * Connect two nodes and create value between them.
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
	 * Disconnect two nodes and remove value between them
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
	 * Check whether or not nodes with specified keys are connected
	 *
	 * @param key1
	 * @param key2
	 */
	connected(key1: NK, key2: NK): boolean {
		const n1 = this.getNode(key1)
		const n2 = this.getNode(key2)

		return _.includes(n1.adjacentNodes().map(n => n.key), key2) &&
			_.includes(n2.adjacentNodes().map(n => n.key), key1)
	}

	getEdges(): GraphEdge<NK, N, EK, E>[] {
		return [...new Set([...this.nodes.values()].flatMap(node => node.edges))]
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
	 * @param startKey
	 * @param goalKey
	 */
	dfs(startKey?: NK, goalKey?: NK): GraphNode<NK, N, EK, E>[] {
		if (this.nodes.size === 0) return []
		if (!startKey) {
			startKey = this.nodes.keys().next().value
		}

		return this.dfsUtil(this.getNode(startKey), goalKey, [])
	}

	/**
	 * A* algorithm implementation.
	 * Pseudocode: https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode.
	 * Finds the shortest route from start node to goal node
	 *
	 * @param startKey
	 * @param goalKey
	 * @param h calculate the distance from one node to another
	 * @param d get edge distance (weight)
	 */
	aStar(startKey: NK, goalKey: NK, h: (node: N, goal: N) => number, d: (edge: E) => number): NK[] {
		const start = this.getNode(startKey)
		const goal = this.getNode(goalKey)

		let openSet: NK[] = [startKey]

		const cameFrom = new Map<NK, NK>()

		const gScore = new Map<NK, number>()
		gScore.set(start.key, 0)

		const fScore = new Map<NK, number>()
		fScore.set(start.key, h(start.value, goal.value))

		while (openSet.length !== 0) {
			let current = openSet.sort(
				(a, b) => this.getDefault(fScore, a, Infinity) - this.getDefault(fScore, b, Infinity)
			)[0]

			if (current === goalKey) {
				return this.backtrack(cameFrom, current)
			}

			openSet = openSet.filter(n => n != current)
			this.getNode(current).adjacentNodes().forEach(neighbor => {
				const tentativeGScore = this.getDefault(gScore, current, Infinity) + d(this.getNode(current).edgeWith(neighbor.key).get().value)
				if (tentativeGScore < this.getDefault(gScore, neighbor.key, Infinity)) {
					cameFrom.set(neighbor.key, current)
					gScore.set(neighbor.key, tentativeGScore)
					fScore.set(neighbor.key, this.getDefault(gScore, neighbor.key, Infinity) + h(neighbor.value, goal.value))
					if (!openSet.find(n => n === neighbor.key)) {
						openSet.push(neighbor.key)
					}
				}
			})
		}

		throw Error('no route found')
	}

	/**
	 * Dijkstra algorithm implementation.
	 * Pseudocode: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Pseudocode.
	 * Finds the shortest route from start node to goal node
	 *
	 * @param startKey
	 * @param goalKey
	 * @param d get edge distance (weight)
	 */
	dijkstra(startKey: NK, goalKey: NK, d: (edge: E) => number): any[] {
		let q: NK[] = [...this.nodes.keys()]
		const dist = new Map()
		const prev = new Map()

		dist.set(startKey, 0)

		while (q.length !== 0) {
			let u = q.sort((a, b) => this.getDefault(dist, a, Infinity) - this.getDefault(dist, b, Infinity))[0]

			q = q.filter(n => n !== u)

			if (u === goalKey) {
				const s = []
				u = goalKey
				if (prev.get(u) !== undefined || u === startKey) {
					while (u) {
						s.unshift(u)
						u = prev.get(u)
					}
				}
				if (s.length === 0) throw Error('no route found')
				return s
			}

			this.getNode(u).adjacentNodes().forEach(v => {
				if (!q.includes(v.key)) return
				const alt: number = this.getDefault(dist, u, Infinity) + d(v.edgeWith(u).get().value)
				if (alt < this.getDefault(dist, v, Infinity)) {
					dist.set(v.key, alt)
					prev.set(v.key, u)
				}
			})
		}
	}

	/**
	 * Get default element if map does not contain element with the specified key
	 *
	 * @param map
	 * @param key
	 * @param def
	 */
	private getDefault<K, V>(map: Map<K, V>, key: K, def: V): V {
		const v = map.get(key)
		return v === undefined ? def : v
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

	private backtrack(cameFrom: Map<NK, NK>, current: NK): NK[] {
		const totalPath = [current]
		while (cameFrom.get(current)) {
			current = cameFrom.get(current)
			totalPath.unshift(current)
		}
		return totalPath
	}

}
