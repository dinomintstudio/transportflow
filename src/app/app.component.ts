import {Component} from '@angular/core';
import {InitService} from "./common/service/init.service";
import {NoiseService} from "./world-generation/service/noise.service";
import {RandomService} from "./random/service/random.service";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	constructor(
		private initService: InitService
	) {
	}

}
