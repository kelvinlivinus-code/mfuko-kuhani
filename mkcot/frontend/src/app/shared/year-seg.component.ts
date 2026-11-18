import { Component, inject } from '@angular/core';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-year-seg',
  standalone: true,
  template: `<div class="seg" role="group" aria-label="Mwaka">
    @for (y of s.years(); track y) { <button [attr.aria-pressed]="'' + (y === s.year())" (click)="s.year.set(y)">{{ y }}</button> }
  </div>`,
})
export class YearSegComponent {
  s = inject(StoreService);
}
