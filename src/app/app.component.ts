import {Component} from '@angular/core';
import {InitService} from "./common/service/init.service";

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
