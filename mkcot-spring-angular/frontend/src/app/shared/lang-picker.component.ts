import { Component } from '@angular/core';

interface Lang {
  c: string;
  n: string;
}

/** Kichaguzi cha lugha: kipo chini kabisa upande wa kushoto kwenye kila ukurasa (kompyuta na simu). */
@Component({
  selector: 'app-lang-picker',
  standalone: true,
  template: `
    <label class="langdock" data-notr title="Lugha / Language">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>
      <select aria-label="Lugha / Language" [value]="lang" (change)="pick($event)">
        @for (l of langs; track l.c) { <option [value]="l.c" [selected]="l.c === lang">{{ l.n }}</option> }
      </select>
    </label>
  `,
})
export class LangPickerComponent {
  langs: Lang[] = (window as any).MFUKO_LANGS || [{ c: 'sw', n: 'Kiswahili' }, { c: 'en', n: 'English' }];
  lang: string = (window as any).MFUKO_LANG || 'sw';

  pick(e: Event) {
    const l = (e.target as HTMLSelectElement).value;
    if (l !== this.lang) (window as any).setLang?.(l);
  }
}
