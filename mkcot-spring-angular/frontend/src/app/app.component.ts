import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiService } from './core/ui.service';
import { DialogHostComponent } from './shared/dialog-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogHostComponent],
  template: `
    <router-outlet />
    <app-dialog-host />
    @for (t of ui.toasts(); track t.id) { <div class="toast" role="status">{{ t.msg }}</div> }
  `,
})
export class AppComponent {
  ui = inject(UiService);
}
