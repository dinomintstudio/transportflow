import {Injectable} from '@angular/core'
import {CommandEvaluationService} from './command-evaluation.service'
import {Log} from '../../common/model/Log'

/**
 * Responsible for executing commands within application context
 */
@Injectable({
	providedIn: 'root'
})
export class CommandService {

	log: Log = new Log(this)

	constructor(
		private commandEvaluationService: CommandEvaluationService
	) {}

	/**
	 * Execute command from string within application context.
	 * Any importable class should be prefixed with `$`.
	 * Example:
	 * <pre>
	 * $renderService.resizeCanvas(new $Shape(100, 100))
	 * </pre>
	 * @param commandString
	 */
	execute(commandString: string): any {
		return this.commandEvaluationService.eval(commandString)
	}

}
