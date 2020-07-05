import {Injectable} from '@angular/core'
import {Command} from '../model/Command'
import {ServiceProviderService} from './service-provider.service'
import {Log} from '../../common/model/Log'

@Injectable({
	providedIn: 'root'
})
export class CommandService {

	log: Log = new Log(this)

	constructor(
		private serviceProviderService: ServiceProviderService
	) {}

	parse(commandString: string): Command {
		const serviceNameRe: RegExp = new RegExp('^.*(?=\\.)')
		const methodNameRe: RegExp = new RegExp('(?<=\\.).*(?=\\()')
		const argsRe: RegExp = new RegExp('(?<=\\().*(?=\\))')

		//TODO: parse error handling
		const serviceName: string = serviceNameRe.exec(commandString)[0]
		const methodName: string = methodNameRe.exec(commandString)[0]
		// TODO: cast args to type
		const args: string[] = argsRe.exec(commandString)[0].split(',').map(s => s.trim())

		const command = new Command(serviceName, methodName, args)

		this.log.debug(`parse command '${commandString}' as ${command.toString()}`)

		return command
	}

	execute(commandString: string): any {
		const command: Command = this.parse(commandString)

		const service = this.serviceProviderService
			.get(command.serviceName)
			.orElseThrow(new Error(`no service found for name ${command.serviceName}`))
		const method = service[command.methodName]

		if (!method) throw new Error(`service ${command.serviceName} has no method ${command.methodName}`)

		return method.call(command.args)
	}

}
