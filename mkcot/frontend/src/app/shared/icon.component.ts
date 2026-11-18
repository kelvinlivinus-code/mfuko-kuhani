import { Component, input } from '@angular/core';
import { ICONS } from '../core/constants';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="d()" /></svg>`,
  host: { class: 'ico' },
})
export class IconComponent {
  name = input.required<string>();
  d = () => ICONS[this.name()] || '';
}
