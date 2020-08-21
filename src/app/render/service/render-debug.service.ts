import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'
import {filter, first} from 'rxjs/operators'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'
import {KeyService} from '../../input/service/key.service'
import {ConfigService} from '../../common/service/config.service'

@Injectable({
	providedIn: 'root'
})
export class RenderDebugService {

	overlayVisible: ObservableData<boolean> = new ObservableData<boolean>(false)

	constructor(
		private keyService: KeyService,
		private configService: ConfigService,
	) {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(renderConfig => {
				this.keyService.keypress.observable
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable),
						filter(e => e.key === renderConfig.debugOverlayKey)
					)
					.subscribe(() => {
						this.overlayVisible.observable
							.pipe(first())
							.subscribe(overlayVisible =>
								this.overlayVisible.set(!overlayVisible)
							)
					})
			})
	}

}
