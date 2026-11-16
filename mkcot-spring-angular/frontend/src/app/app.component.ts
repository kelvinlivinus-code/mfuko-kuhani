import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiService } from './core/ui.service';
import { DialogHostComponent } from './shared/dialog-host.component';
import { LangPickerComponent } from './shared/lang-picker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogHostComponent, LangPickerComponent],
  template: `
    <router-outlet />
    <app-dialog-host />
    <app-lang-picker />
    @for (t of ui.toasts(); track t.id) { <div class="toast" role="status">{{ t.msg }}</div> }
  `,
})
export class AppComponent {
  ui = inject(UiService);
}
