import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {Camera} from "../model/Camera";

@Injectable({
	providedIn: 'root'
})
export class CameraService {

	camera: ObservableData<Camera> = new ObservableData();

	constructor() {
	}

}
