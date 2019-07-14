import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ClockService} from "./clock.service";
import {filter} from "rxjs/operators";
import * as config from "../config/scheduling.config.json";

@Injectable({
  providedIn: 'root'
})
export class ShortTermSchedulingService {

  tick: Observable<number>;

  constructor(
      private clockService: ClockService
  ) {
    this.tick = this.clockService.tick.observable
        .pipe(
            filter(tick => tick % config.shortTermK === 0)
        );
  }

}
