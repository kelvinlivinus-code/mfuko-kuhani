import { Injectable, Type, signal } from '@angular/core';

export interface FieldSpec {
  k: string;
  label?: string;
  type?: 'text' | 'password' | 'number' | 'date' | 'tel' | 'select' | 'textarea' | 'multi' | 'months' | 'deps';
  required?: boolean;
  options?: (string | [string, string])[];
  blank?: string;
  ph?: string;
  help?: string;
  full?: boolean;
  def?: unknown;
  show?: (v: Record<string, any>) => boolean;
  onChange?: (v: Record<string, any>) => void;
}
export interface FormSpec {
  title: string;
  intro?: string;
  fields: FieldSpec[];
  values?: Record<string, any>;
  submit?: string;
  /** Inarudisha true/undefined kufunga, false kubaki wazi, au maandishi ya kosa. */
  onSubmit: (v: Record<string, any>) => Promise<boolean | string | void | null | object> | boolean | string | void | null | object;
}
export interface DialogSpec {
  kind: 'form' | 'confirm' | 'component';
  title: string;
  form?: FormSpec;
  text?: string;
  yes?: string;
  onYes?: () => Promise<boolean> | boolean;
  component?: Type<unknown>;
  inputs?: Record<string, unknown>;
  seq: number;
}

/** Ujumbe mfupi (toast) na dirisha (dialog) moja la mfumo mzima. */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly toasts = signal<{ id: number; msg: string }[]>([]);
  readonly dialog = signal<DialogSpec | null>(null);
  private n = 0;

  toast(msg: string) {
    const id = ++this.n;
    this.toasts.update((t) => [...t, { id, msg }]);
    setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== id)), 2600);
  }

  openForm(form: FormSpec) {
    this.dialog.set({ kind: 'form', title: form.title, form, seq: ++this.n });
  }

  confirm(text: string, yes: string, onYes: () => Promise<boolean> | boolean) {
    this.dialog.set({ kind: 'confirm', title: 'Thibitisha', text, yes, onYes, seq: ++this.n });
  }

  openComponent(title: string, component: Type<unknown>, inputs: Record<string, unknown>) {
    this.dialog.set({ kind: 'component', title, component, inputs, seq: ++this.n });
  }

  close() {
    this.dialog.set(null);
  }
}
