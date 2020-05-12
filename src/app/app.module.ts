import {BrowserModule} from '@angular/platform-browser'
import {NgModule} from '@angular/core'

import {AppComponent} from './app.component'
import {GuiComponent} from './web/gui/gui.component'
import {MenuComponent} from './web/menu/menu.component'
import {CanvasComponent} from './web/canvas/canvas.component'
import {DebugOverlayComponent} from './web/debug-overlay/debug-overlay.component'
import {ConsoleComponent} from './web/console/console.component'
import {EventSourceDirective} from './web/directive/event-source.directive'
import {FormsModule} from '@angular/forms'
import {AutofocusDirective} from './web/directive/autofocus.directive'

@NgModule({
	declarations: [
		AppComponent,
		GuiComponent,
		MenuComponent,
		CanvasComponent,
		DebugOverlayComponent,
		ConsoleComponent,
		EventSourceDirective,
		AutofocusDirective
	],
	imports: [
		BrowserModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
