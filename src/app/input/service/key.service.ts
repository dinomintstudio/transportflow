import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'

/**
 * Provides observables for keyboard events
 */
@Injectable({
	providedIn: 'root'
})
export class KeyService {

	/**
	 * Observable of key presses
	 */
	keypress: ObservableData<KeyboardEvent>

	constructor() {
		this.keypress = new ObservableData<KeyboardEvent>()
	}

}
