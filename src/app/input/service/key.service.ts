import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'

@Injectable({
	providedIn: 'root'
})
export class KeyService {

	keypress: ObservableData<KeyboardEvent>

	constructor() {
		this.keypress = new ObservableData<KeyboardEvent>()
	}

}
