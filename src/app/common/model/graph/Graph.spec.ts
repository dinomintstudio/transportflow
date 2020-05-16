import {Graph} from './Graph'
import {Log} from '../Log'

describe('Graph', () => {

	const log = new Log()

	beforeEach(() => {
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

		expect(graph.nodes.size).toEqual(3)

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

		expect(graph.nodes.size).toEqual(3)

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

	it('should disconnect edge', () => {
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

})
