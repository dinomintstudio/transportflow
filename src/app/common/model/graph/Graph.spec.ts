import {Graph} from './Graph'
import {Log} from '../Log'
import {Position} from '../Position'

describe('Graph', () => {

	const log: Log = new Log()
	let testGraph: Graph<number, void, string, void>
	let testGraph2: Graph<number, Position, string, number>

	beforeEach(() => {
		testGraph = new Graph<number, void, string, void>()
		testGraph.addNode(1)
		testGraph.addNode(2)
		testGraph.addNode(3)
		testGraph.addNode(4)
		testGraph.addNode(5)
		testGraph.addNode(6)
		testGraph.connect(1, 2, '12')
		testGraph.connect(1, 3, '13')
		testGraph.connect(2, 5, '25')
		testGraph.connect(3, 4, '34')
		testGraph.connect(3, 6, '36')
		testGraph.connect(5, 6, '56')
		testGraph.connect(6, 2, '62')

		testGraph2 = new Graph<number, Position, string, number>()
		testGraph2.addNode(1, new Position(0, 0))
		testGraph2.addNode(2, new Position(2, 0))
		testGraph2.addNode(3, new Position(4, 2))
		testGraph2.addNode(4, new Position(3, 4))
		testGraph2.addNode(5, new Position(2, 4))
		testGraph2.addNode(6, new Position(1, 2))
		testGraph2.connect(1, 3, '13', 2)
		testGraph2.connect(2, 5, '25', 4)
		testGraph2.connect(3, 4, '34', 1)
		testGraph2.connect(3, 6, '36', 3)
		testGraph2.connect(5, 6, '56', 4)
		testGraph2.connect(6, 2, '62', 10)
	})

	it('should create empty graph', () => {
		const graph = new Graph()
		expect(graph).toBeDefined()
		expect(graph.nodes).toBeDefined()
	})

	it('should create graph', () => {
		const graph = new Graph<number, void, number, void>()
		graph.addNode(1)
		graph.addNode(2)
		graph.addNode(3)
		graph.connect(1, 2, 12)

		expect(graph.nodes.size()).toEqual(3)

		const n1 = graph.getNode(1)
		expect(n1).toBeDefined()
		expect(n1.edges.length).toEqual(1)
		expect(n1.edges[0].key).toEqual(12)

		const n2 = graph.getNode(2)
		expect(n2).toBeDefined()
		expect(n2.edges.length).toEqual(1)
		expect(n2.edges[0].key).toEqual(12)

		expect(n1.edges[0]).toEqual(n2.edges[0])

		const n3 = graph.getNode(3)
		expect(n3).toBeDefined()
		expect(n3.edges.length).toEqual(0)

		log.info(graph.adjacencyList())
	})

	it('should create cyclic graph', () => {
		const graph = new Graph<number, void, string, void>()
		graph.addNode(1)
		graph.addNode(2)
		graph.addNode(3)
		graph.connect(1, 2, '12')
		graph.connect(2, 3, '23')
		graph.connect(3, 1, '31')

		expect(graph.nodes.size()).toEqual(3)

		const n1 = graph.getNode(1)
		expect(n1).toBeDefined()
		expect(n1.edges.length).toEqual(2)
		expect(n1.edges.map(e => e.key).some(k => ['12', '31'].includes(k))).toBeTruthy()

		const n2 = graph.getNode(2)
		expect(n2).toBeDefined()
		expect(n2.edges.length).toEqual(2)
		expect(n2.edges.map(e => e.key).some(k => ['12', '23'].includes(k))).toBeTruthy()

		const n3 = graph.getNode(3)
		expect(n3).toBeDefined()
		expect(n3.edges.length).toEqual(2)
		expect(n3.edges.map(e => e.key).some(k => ['23', '31'].includes(k))).toBeTruthy()

		log.info(graph.adjacencyList())
	})

	it('should disconnect value', () => {
		const graph = new Graph<number, void, number, void>()
		graph.addNode(1)
		graph.addNode(2)
		graph.connect(1, 2, 12)
		graph.disconnect(1, 2)

		const n1 = graph.getNode(1)
		expect(n1.edges.length).toEqual(0)

		const n2 = graph.getNode(2)
		expect(n2.edges.length).toEqual(0)

		log.info(graph.adjacencyList())
	})

	it('should not create graph with loop node', () => {
		const graph = new Graph<number, void, number, void>()
		graph.addNode(1)
		expect(() => graph.connect(1, 1, 11)).toThrow()
	})

	it('should traverse using BFS', () => {
		expect(testGraph.bfs().length).toBe(testGraph.nodes.size())
	})

	it('should traverse using BFS until end node', () => {
		const bfsResult = testGraph.bfs(1, 2)
		expect(bfsResult.length).toBeLessThanOrEqual(testGraph.nodes.size())
		expect(bfsResult.map(n => n.key).includes(2)).toBeTruthy()
	})

	it('should traverse using DFS', () => {
		expect(testGraph.dfs().length).toBe(testGraph.nodes.size())
	})

	it('should traverse using DFS until end node', () => {
		const dfsResult = testGraph.dfs(1, 2)
		expect(dfsResult.length).toBeLessThanOrEqual(testGraph.nodes.size())
		expect(dfsResult.map(n => n.key).includes(2)).toBeTruthy()
	})

	it('should split into components', () => {
		const graph = new Graph<number, void, string, void>()
		graph.addNode(1)
		graph.addNode(2)
		graph.addNode(3)
		graph.addNode(4)
		graph.addNode(5)
		graph.connect(1, 2, '12')
		graph.connect(4, 3, '34')

		const components = graph.getComponents()
		expect(components.length).toBe(3)
		expect(components[0].nodes.size()).toBe(2)
		expect(components[1].nodes.size()).toBe(2)

		graph.removeNode(5)

		expect(graph.getComponents().length).toBe(2)
	})

	it('should find route with dijkstra', () => {
		const route = testGraph2.dijkstra(1, 4, e => e)
		expect(route).toEqual([1, 3, 4])
	})

	it('should find route with A*', () => {
		const route = testGraph2.aStar(1, 4, Position.distance, e => e)
		expect(route).toEqual([1, 3, 4])
	})

})
