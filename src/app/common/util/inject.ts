import {Injector} from '@angular/core'

export const inject = <T>(injector: Injector, type: any, oncomplete: (injected) => any): void => {
	setTimeout(() =>
			oncomplete(injector.get(type)),
		0
	)
}
