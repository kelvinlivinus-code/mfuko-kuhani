import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { UiService } from '../core/ui.service';
import { FormDialogComponent } from './form-dialog.component';

/** Dirisha moja (<dialog>) la mfumo mzima: fomu, uthibitisho au maelezo ya kumbukumbu. */
@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [FormDialogComponent, NgComponentOutlet],
  template: `
    <dialog #dlg (close)="ui.close()" (click)="backdrop($event)">
      @if (ui.dialog(); as d) {
        <div class="dlg">
          <header><h2>{{ d.title }}</h2><button class="x" aria-label="Funga" (click)="ui.close()">×</button></header>
          @switch (d.kind) {
            @case ('form') {
              @for (k of [d.seq]; track k) { <app-form-dialog [spec]="d.form!" /> }
            }
            @case ('confirm') {
              <div class="body"><p class="prose">{{ d.text }}</p></div>
              <footer>
                <button class="btn" (click)="ui.close()">Ghairi</button>
                <button class="btn danger" [disabled]="busy()" (click)="yes()">{{ d.yes || 'Futa' }}</button>
              </footer>
            }
            @case ('component') {
              @for (k of [d.seq]; track k) { <ng-container *ngComponentOutlet="d.component!; inputs: d.inputs" /> }
            }
          }
        </div>
      }
    </dialog>
  `,
})
export class DialogHostComponent {
  ui = inject(UiService);
  busy = signal(false);
  private dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.ui.dialog();
      const el = this.dlg().nativeElement;
      if (d && !el.open) {
        try {
          el.showModal();
        } catch {
          el.setAttribute('open', '');
        }
      } else if (!d && el.open) {
        el.close();
      }
    });
  }

  backdrop(e: MouseEvent) {
    if (e.target === this.dlg().nativeElement) this.ui.close();
  }

  async yes() {
    const d = this.ui.dialog();
    if (!d?.onYes) return;
    this.busy.set(true);
    try {
      const ok = await d.onYes();
      if (ok && this.ui.dialog() === d) this.ui.close();
    } finally {
      this.busy.set(false);
    }
  }
}
