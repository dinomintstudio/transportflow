import {TestBed} from '@angular/core/testing'
import {CommandService} from './command.service'

describe('CommandService', () => {

	let service: CommandService

	beforeEach(() => {
		TestBed.configureTestingModule({providers: [CommandService]})
		service = TestBed.get(CommandService)
	})

	it('should initialize', () => {
		expect(service).toBeDefined()
	})

	it('should execute simple expression', () => {
		const result: any = service.execute('2 + 2')
		expect(result).toBe(4)
	})

	it('should execute `this` expression', () => {
		const result: any = service.execute('new $Shape()')
		expect(result).toBe('[100x100]')
	})

	it('should support initialization', () => {
		service.execute('$a = 1')
		const result: any = service.execute('$a')
		expect(result).toBe('1')
	})

})
