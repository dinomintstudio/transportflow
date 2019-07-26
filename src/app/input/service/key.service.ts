import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";

@Injectable({
	providedIn: 'root'
})
export class KeyService {

	keypressObservable: ObservableData<KeyboardEvent>;

	constructor() {
		this.keypressObservable = new ObservableData<KeyboardEvent>();
	}

}
