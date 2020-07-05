import {Injectable} from '@angular/core'
import {RenderService} from '../../render/service/render.service'
import {Maybe} from '../../common/model/Maybe'

@Injectable({
	providedIn: 'root'
})
export class ServiceProviderService {

	private serviceMap: Map<string, any>

	constructor(
		// TODO: add another services
		private renderService: RenderService
	) {
		this.serviceMap = new Map<string, any>([
			...[
				renderService
			].map(this.getServiceNameServicePair)
		])
	}

	getServiceNameServicePair(service: any): [string, any] {
		return [service.constructor.name, service]
	}

	get(serviceName: string): Maybe<any> {
		return new Maybe(
			[...this.serviceMap.entries()]
				.filter(e => e[0].toLowerCase() === serviceName.toLowerCase())
				.map(e => e[1])[0]
		)
	}

}
