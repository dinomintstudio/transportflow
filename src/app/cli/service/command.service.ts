import {Injectable} from '@angular/core'
import {CommandEvaluationService} from './command-evaluation.service'
import {Log} from '../../common/model/Log'

@Injectable({
	providedIn: 'root'
})
export class CommandService {

	log: Log = new Log(this)

	constructor(
		private commandEvaluationService: CommandEvaluationService
	) {}

	execute(commandString: string): any {
		return this.commandEvaluationService.eval(commandString)
	}

}
