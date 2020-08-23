import {Injectable} from '@angular/core'
import {RoadService} from './road.service'
import {Log} from '../../common/model/Log'

@Injectable({
	providedIn: 'root'
})
export class NavigationService {

	log: Log = new Log(this)

	constructor(
		private roadService: RoadService
	) {}

}
