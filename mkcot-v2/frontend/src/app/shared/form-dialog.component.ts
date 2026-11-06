import { Component, ElementRef, computed, inject, input, signal, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MONTHS_FULL, RELATIONS } from '../core/constants';
import { FieldSpec, FormSpec, UiService } from '../core/ui.service';

/** Fomu moja inayotumika kwa kila aina ya kumbukumbu (kama openForm ya toleo la awali). */
@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="body">
      @if (spec().intro) { <p class="muted" style="margin:0">{{ spec().intro }}</p> }
      <form class="fgrid" novalidate (ngSubmit)="go()">
        @for (f of spec().fields; track f.k) {
          @if (f.type === 'deps') {
            <div class="field full">
              <span class="lab">Wategemezi (mke/mume, watoto, wazazi)</span>
              <div style="display:flex;flex-direction:column;gap:8px">
                @for (d of v[f.k]; track $index; let i = $index) {
                  <div class="deprow">
                    <div class="field"><label [for]="'dn' + i">Jina</label><input [id]="'dn' + i" [(ngModel)]="d.name" [name]="'dn' + i" /></div>
                    <div class="field"><label [for]="'dr' + i">Uhusiano</label>
                      <select [id]="'dr' + i" [(ngModel)]="d.relation" [name]="'dr' + i">@for (r of relations; track r) { <option [value]="r">{{ r }}</option> }</select></div>
                    <div class="field"><label [for]="'dd' + i">Tarehe ya kuzaliwa</label><input type="date" [id]="'dd' + i" [(ngModel)]="d.dob" [name]="'dd' + i" /></div>
                    <div class="field"><label [for]="'da' + i">Hali</label>
                      <select [id]="'da' + i" [(ngModel)]="d.alive" [name]="'da' + i"><option value="Hai">Hai</option><option value="Amefariki">Amefariki</option></select></div>
                    <button type="button" class="btn sm danger" aria-label="Ondoa" (click)="v[f.k].splice(i, 1)">Ondoa</button>
                  </div>
                }
              </div>
              <div><button type="button" class="btn sm" (click)="v[f.k].push({ name: '', relation: 'Mtoto', dob: '', alive: 'Hai' })">+ Ongeza mtegemezi</button></div>
            </div>
          } @else if (visible(f)) {
            <div class="field" [class.full]="f.full || f.type === 'textarea' || f.type === 'multi' || f.type === 'months'" [attr.data-k]="f.k">
              @if (f.type === 'multi' || f.type === 'months') {
                <span class="lab">{{ f.label }}{{ f.required ? ' *' : '' }}</span>
                <div class="checks" [id]="'f_' + f.k">
                  @for (o of opts(f); track o[0]) {
                    <label><input type="checkbox" [checked]="has(f, o[0])" (change)="toggle(f, o[0])" />{{ o[1] }}</label>
                  }
                </div>
              } @else {
                <label class="lab" [for]="'f_' + f.k">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
                @switch (f.type) {
                  @case ('select') {
                    <select [id]="'f_' + f.k" [name]="f.k" [(ngModel)]="v[f.k]" (ngModelChange)="changed(f)">
                      @if (f.blank) { <option value="">{{ f.blank }}</option> }
                      @for (o of opts(f); track o[0]) { <option [value]="o[0]">{{ o[1] }}</option> }
                    </select>
                  }
                  @case ('textarea') {
                    <textarea [id]="'f_' + f.k" [name]="f.k" [(ngModel)]="v[f.k]" [placeholder]="f.ph || ''"></textarea>
                  }
                  @default {
                    <input [id]="'f_' + f.k" [name]="f.k" [type]="f.type || 'text'" [(ngModel)]="v[f.k]" [placeholder]="f.ph || ''"
                      [attr.step]="f.type === 'number' ? 'any' : null" [attr.min]="f.type === 'number' ? '0' : null" />
                  }
                }
              }
              @if (f.help) { <span class="help">{{ f.help }}</span> }
            </div>
          }
        }
        <button type="submit" hidden></button>
      </form>
      <p class="help" style="color:var(--bad);margin:0" role="alert">{{ err() }}</p>
    </div>
    <footer>
      <button class="btn" type="button" (click)="ui.close()">Ghairi</button>
      <button class="btn pri" type="button" [disabled]="busy()" (click)="go()">{{ spec().submit || 'Hifadhi' }}</button>
    </footer>
  `,
})
export class FormDialogComponent implements AfterViewInit {
  ui = inject(UiService);
  private el = inject(ElementRef<HTMLElement>);
  spec = input.required<FormSpec>();
  relations = RELATIONS;
  err = signal('');
  busy = signal(false);
  v: Record<string, any> = {};

  ngOnInit() {
    const s = this.spec();
    const vals = s.values || {};
    for (const f of s.fields) {
      let x = vals[f.k] ?? f.def;
      if (f.type === 'deps') x = (x || []).map((d: any) => ({ relation: 'Mtoto', alive: 'Hai', ...d }));
      else if (f.type === 'multi' || f.type === 'months') x = [...(x || [])].map(String);
      else if (x === null || x === undefined) x = '';
      this.v[f.k] = x;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.el.nativeElement.querySelector('input,select,textarea')?.focus(), 30);
  }

  opts(f: FieldSpec): [string, string][] {
    if (f.type === 'months') return MONTHS_FULL.map((m, i) => [String(i + 1), m]);
    return (f.options || []).map((o) => (Array.isArray(o) ? [String(o[0]), o[1]] : [o, o]));
  }
  has(f: FieldSpec, k: string) {
    return (this.v[f.k] as string[]).includes(k);
  }
  toggle(f: FieldSpec, k: string) {
    const a = this.v[f.k] as string[];
    this.v[f.k] = a.includes(k) ? a.filter((x) => x !== k) : [...a, k];
  }
  visible(f: FieldSpec) {
    return !f.show || f.show(this.read());
  }
  changed(f: FieldSpec) {
    f.onChange?.(this.v);
  }

  private read(): Record<string, any> {
    const out: Record<string, any> = {};
    for (const f of this.spec().fields) {
      const x = this.v[f.k];
      if (f.type === 'months') out[f.k] = (x as string[]).map(Number).sort((a, b) => a - b);
      else if (f.type === 'multi') out[f.k] = [...x];
      else if (f.type === 'deps') out[f.k] = (x as any[]).map((d) => ({ ...d, name: String(d.name || '').trim() })).filter((d) => d.name);
      else if (f.type === 'number') out[f.k] = x === '' || x === null ? '' : Number(x);
      else out[f.k] = typeof x === 'string' ? x.trim() : x;
    }
    return out;
  }

  async go() {
    if (this.busy()) return;
    const v = this.read();
    for (const f of this.spec().fields) {
      if (!f.required || !this.visible(f)) continue;
      const x = v[f.k];
      if (x === '' || x == null || (Array.isArray(x) && !x.length)) {
        this.err.set(`Jaza sehemu ya "${f.label}".`);
        (this.el.nativeElement.querySelector('#f_' + f.k) as HTMLElement | null)?.focus();
        return;
      }
    }
    for (const f of this.spec().fields) if (!this.visible(f)) delete v[f.k];
    this.busy.set(true);
    try {
      const res = await this.spec().onSubmit(v);
      if (typeof res === 'string') {
        this.err.set(res);
        return;
      }
      if (res !== false && res !== null) this.ui.close();
    } finally {
      this.busy.set(false);
    }
  }
}
