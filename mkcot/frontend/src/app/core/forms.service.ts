import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EV_KINDS, EV_REL, MEET_KINDS, MONTHS_FULL, PAY_TYPES, POSITIONS, PROJ_STATUS, STATUS } from './constants';
import { CabinetMember, LedgerEntry, Loan, Meeting, Member, Notice, Project, SupportEvent } from './models';
import { StoreService } from './store.service';
import { UiService } from './ui.service';
import { tsh, todayISO } from './util';
import { EventDetailComponent, LoanDetailComponent, MeetingDetailComponent, ProjectDetailComponent } from '../shared/details';

/** Fomu za kila aina ya kumbukumbu na madirisha ya maelezo yake. */
@Injectable({ providedIn: 'root' })
export class FormsService {
  private s = inject(StoreService);
  private ui = inject(UiService);
  private router = inject(Router);

  memberForm(m?: Member) {
    const isNew = !m;
    const cur: Partial<Member> = m || {};
    const canPay = this.s.can('payments');
    this.ui.openForm({
      title: isNew ? 'Sajili mwanachama mpya' : 'Hariri taarifa za ' + cur.name,
      values: {
        no: cur.no || this.s.nextNo('COT-', this.s.members()), joinDate: todayISO(), status: 'Hai', usaili: 'Bado', ...cur,
        deps: cur.deps || [], payEntry: canPay ? 'ndiyo' : 'hapana', entryAmount: this.s.settings().entryFee,
      },
      fields: [
        { k: 'no', label: 'Namba ya mwanachama', required: true },
        { k: 'rank', label: 'Cheo', ph: 'mf. Sajini' },
        { k: 'name', label: 'Jina kamili', required: true },
        { k: 'armyNo', label: 'Namba ya jeshi' },
        { k: 'unit', label: 'Kikosi / Idara' },
        { k: 'phone', label: 'Simu', type: 'tel' },
        { k: 'joinDate', label: 'Tarehe ya kujiunga', type: 'date', required: true },
        { k: 'status', label: 'Hali ya uanachama', type: 'select', options: STATUS },
        { k: 'usaili', label: 'Usaili wa awali', type: 'select', options: ['Bado', 'Amefanyiwa'] },
        { k: 'usailiDate', label: 'Tarehe ya usaili', type: 'date', show: (v) => v['usaili'] === 'Amefanyiwa' },
        { k: 'address', label: 'Makazi' },
        { k: 'kin', label: 'Ndugu wa karibu (mrithi)' },
        { k: 'kinPhone', label: 'Simu ya ndugu wa karibu', type: 'tel' },
        { k: 'deps', type: 'deps' },
        ...(isNew && canPay
          ? [
              { k: 'payEntry', label: 'Rekodi ada ya kiingilio sasa?', type: 'select' as const, options: [['ndiyo', 'Ndiyo, amelipa'], ['hapana', 'Hapana, bado']] as [string, string][] },
              { k: 'entryAmount', label: 'Kiasi cha kiingilio', type: 'number' as const, show: (v: any) => v['payEntry'] === 'ndiyo' },
            ]
          : []),
        { k: 'notes', label: 'Maelezo mengine', type: 'textarea' },
      ],
      onSubmit: async (v) => {
        const { payEntry, entryAmount, ...rest } = v;
        const dup = this.s.members().find((x) => x.id !== cur.id && x.no && x.no === rest['no']);
        if (dup) return `Namba ${rest['no']} tayari inatumiwa na ${dup.name}.`;
        if (!isNew) return this.s.save('members', cur.id, rest);
        const saved = await this.s.save('members', null, rest, true);
        if (!saved) return false;
        if (payEntry === 'ndiyo' && Number(entryAmount) > 0)
          await this.s.save('payments', null, {
            memberId: saved.id, type: 'kiingilio', amount: Number(entryAmount), date: rest['joinDate'] || todayISO(), receipt: '',
            note: 'Ada ya kiingilio wakati wa usajili',
          }, true);
        this.ui.toast('Mwanachama amesajiliwa');
        this.router.navigate(['/wanachama', saved.id]);
        return true;
      },
    });
  }

  paymentForm(pre: { memberId?: string; type?: string; year?: number; months?: number[]; amount?: number } = {}) {
    const Y = pre.year || this.s.year();
    const st = this.s.settings();
    const amt = (t: string) => (t === 'kiingilio' ? st.entryFee : t === 'mwezi' ? st.monthlyFee : '');
    const paidMonths = (mid: string, y: number) => {
      const set = new Set<number>();
      for (const p of this.s.payments()) if (p.memberId === mid && p.type === 'mwezi' && Number(p.year) === Number(y)) set.add(Number(p.month));
      return set;
    };
    this.ui.openForm({
      title: 'Rekodi malipo',
      intro: 'Kwa michango ya mwezi, chagua miezi yote anayolipia; kila mwezi unahifadhiwa peke yake.',
      values: { memberId: pre.memberId || '', type: pre.type || 'mwezi', year: Y, months: pre.months || [], amount: pre.amount ?? amt(pre.type || 'mwezi'), date: todayISO() },
      fields: [
        { k: 'memberId', label: 'Mwanachama', type: 'select', required: true, blank: 'Chagua mwanachama', options: this.s.memberOptions(false) },
        { k: 'type', label: 'Aina ya malipo', type: 'select', options: Object.entries(PAY_TYPES), onChange: (v) => (v['amount'] = amt(v['type'])) },
        { k: 'year', label: 'Mwaka wa mchango', type: 'number', show: (v) => v['type'] === 'mwezi' },
        { k: 'months', label: 'Miezi anayolipia', type: 'months', show: (v) => v['type'] === 'mwezi', required: true },
        { k: 'amount', label: 'Kiasi (kwa kila mwezi kama ni mchango wa mwezi)', type: 'number', required: true },
        { k: 'date', label: 'Tarehe ya kulipa', type: 'date', required: true },
        { k: 'receipt', label: 'Namba ya risiti / muamala' },
        { k: 'note', label: 'Maelezo', full: true },
      ],
      onSubmit: async (v) => {
        if (!(Number(v['amount']) > 0)) return 'Weka kiasi kilicho zaidi ya sifuri.';
        if (v['type'] !== 'mwezi')
          return this.s.save('payments', null, { memberId: v['memberId'], type: v['type'], amount: Number(v['amount']), date: v['date'], receipt: v['receipt'], note: v['note'] });
        const done = paidMonths(v['memberId'], v['year']);
        const todo = (v['months'] as number[]).filter((m) => !done.has(m));
        if (!todo.length) return 'Miezi uliyochagua tayari imelipwa kwa mwanachama huyu.';
        for (const mo of todo) {
          const ok = await this.s.save('payments', null, {
            memberId: v['memberId'], type: 'mwezi', year: Number(v['year']), month: mo, amount: Number(v['amount']), date: v['date'], receipt: v['receipt'], note: v['note'],
          }, true);
          if (!ok) return false;
        }
        this.ui.toast(`Michango ya miezi ${todo.length} imehifadhiwa` + (todo.length < v['months'].length ? ' (miezi iliyolipwa awali imerukwa)' : ''));
        return true;
      },
    });
  }

  eventForm(e?: Partial<SupportEvent>) {
    const isNew = !e?.id;
    const cur = e || {};
    this.ui.openForm({
      title: isNew ? 'Rekodi tukio la kuhaniwa' : 'Hariri tukio',
      values: { date: todayISO(), kind: 'Msiba', relation: 'Mtoto', status: 'Imelipwa', ...cur },
      fields: [
        { k: 'memberId', label: 'Mwanachama anayehaniwa', type: 'select', required: true, blank: 'Chagua mwanachama', options: this.s.memberOptions(false) },
        { k: 'date', label: 'Tarehe ya tukio', type: 'date', required: true },
        { k: 'kind', label: 'Aina ya tukio', type: 'select', options: EV_KINDS },
        { k: 'relation', label: 'Muhusika ni nani kwa mwanachama', type: 'select', options: EV_REL },
        { k: 'person', label: 'Jina la muhusika', ph: 'mf. jina la marehemu' },
        { k: 'place', label: 'Mahali' },
        { k: 'amount', label: 'Kiasi kilichotolewa na mfuko', type: 'number', required: true },
        { k: 'status', label: 'Hali ya malipo', type: 'select', options: ['Imelipwa', 'Inasubiri'] },
        { k: 'payDate', label: 'Tarehe ya kulipwa', type: 'date' },
        { k: 'approvedBy', label: 'Aliyeidhinisha' },
        { k: 'receipt', label: 'Namba ya risiti / muamala' },
        { k: 'description', label: 'Maelezo ya tukio', type: 'textarea' },
      ],
      onSubmit: (v) => this.s.save('events', cur.id, { ...v, amount: Number(v['amount']) || 0 }),
    });
  }

  loanForm(l?: Loan) {
    const isNew = !l;
    const cur: Partial<Loan> = l || {};
    this.ui.openForm({
      title: isNew ? 'Toa mkopo mpya' : 'Hariri mkopo ' + cur.no,
      intro: 'Mikopo inatolewa kwa wanachama hai tu.',
      values: { no: cur.no || this.s.nextNo('MK', this.s.loans()), date: todayISO(), rate: this.s.settings().interestRate, months: 6, ...cur },
      fields: [
        { k: 'no', label: 'Namba ya mkopo', required: true },
        { k: 'memberId', label: 'Mwanachama', type: 'select', required: true, blank: 'Chagua mwanachama', options: this.s.memberOptions(isNew) },
        { k: 'date', label: 'Tarehe ya kutolewa', type: 'date', required: true },
        { k: 'principal', label: 'Kiasi cha mkopo', type: 'number', required: true },
        { k: 'rate', label: 'Riba (%)', type: 'number' },
        { k: 'months', label: 'Muda wa kurejesha (miezi)', type: 'number', required: true },
        { k: 'guarantor', label: 'Mdhamini' },
        { k: 'purpose', label: 'Madhumuni ya mkopo' },
        { k: 'note', label: 'Maelezo', type: 'textarea' },
      ],
      onSubmit: (v) => {
        if (!(Number(v['principal']) > 0)) return 'Weka kiasi cha mkopo.';
        const dup = this.s.loans().find((x) => x.id !== cur.id && x.no === v['no']);
        if (dup) return `Namba ${v['no']} tayari ipo.`;
        return this.s.save('loans', cur.id, { ...v, principal: Number(v['principal']), months: Number(v['months']) || 0, repayments: cur.repayments || [] });
      },
    });
  }

  repayForm(l: Loan) {
    const c = this.s.loanCalc(l);
    this.ui.openForm({
      title: 'Rekodi rejesho · ' + l.no,
      intro: `${this.s.mname(l.memberId)} · salio linalodaiwa ${tsh(c.bal)}`,
      values: { date: todayISO(), amount: Math.round(Math.min(c.monthly || c.bal, c.bal)) },
      fields: [
        { k: 'date', label: 'Tarehe', type: 'date', required: true },
        { k: 'amount', label: 'Kiasi kilicholipwa', type: 'number', required: true },
        { k: 'receipt', label: 'Namba ya risiti' },
        { k: 'note', label: 'Maelezo' },
      ],
      onSubmit: async (v) => {
        if (!(Number(v['amount']) > 0)) return 'Weka kiasi.';
        const now = this.s.loans().find((x) => x.id === l.id) || l;
        const ok = await this.s.save('loans', l.id, { repayments: [...(now.repayments || []), { ...v, amount: Number(v['amount']), at: new Date().toISOString() }] });
        if (ok) setTimeout(() => this.loanDetail(l.id), 50);
        return ok;
      },
    });
  }

  projectForm(p?: Project) {
    const isNew = !p;
    const cur: Partial<Project> = p || {};
    this.ui.openForm({
      title: isNew ? 'Anzisha mradi' : 'Hariri mradi',
      values: { status: 'Wazo', startDate: todayISO(), ...cur },
      fields: [
        { k: 'name', label: 'Jina la mradi', required: true },
        { k: 'status', label: 'Hali', type: 'select', options: PROJ_STATUS },
        { k: 'startDate', label: 'Tarehe ya kuanza', type: 'date' },
        { k: 'lead', label: 'Msimamizi wa mradi' },
        { k: 'budget', label: 'Bajeti iliyopangwa', type: 'number' },
        { k: 'description', label: 'Maelezo ya mradi', type: 'textarea' },
      ],
      onSubmit: (v) => this.s.save('projects', cur.id, { ...v, budget: v['budget'] === '' ? null : Number(v['budget']), entries: cur.entries || [] }),
    });
  }

  projEntryForm(p: Project) {
    this.ui.openForm({
      title: 'Ingiza fedha za mradi · ' + p.name,
      values: { date: todayISO(), kind: 'uwekezaji' },
      fields: [
        { k: 'kind', label: 'Aina', type: 'select', options: [['uwekezaji', 'Uwekezaji (mtaji kutoka mfuko)'], ['mapato', 'Mapato ya mradi'], ['matumizi', 'Matumizi ya mradi']] },
        { k: 'date', label: 'Tarehe', type: 'date', required: true },
        { k: 'amount', label: 'Kiasi', type: 'number', required: true },
        { k: 'note', label: 'Maelezo', full: true },
      ],
      onSubmit: async (v) => {
        if (!(Number(v['amount']) > 0)) return 'Weka kiasi.';
        const now = this.s.projects().find((x) => x.id === p.id) || p;
        const ok = await this.s.save('projects', p.id, { entries: [...(now.entries || []), { ...v, amount: Number(v['amount']) }] });
        if (ok) setTimeout(() => this.projectDetail(p.id), 50);
        return ok;
      },
    });
  }

  cabinetForm(c?: CabinetMember) {
    const isNew = !c;
    const cur: Partial<CabinetMember> = c || {};
    this.ui.openForm({
      title: isNew ? 'Ongeza kiongozi' : 'Hariri kiongozi',
      values: { position: 'Mwenyekiti', termStart: todayISO(), status: 'Yupo madarakani', ...cur },
      fields: [
        { k: 'position', label: 'Nafasi', type: 'select', options: POSITIONS },
        { k: 'memberId', label: 'Mwanachama', type: 'select', blank: 'Si mwanachama / andika jina chini', options: this.s.memberOptions(false) },
        { k: 'name', label: 'Jina (kama si mwanachama aliyesajiliwa)', show: (v) => !v['memberId'] },
        { k: 'phone', label: 'Simu', type: 'tel' },
        { k: 'termStart', label: 'Mwanzo wa kipindi', type: 'date' },
        { k: 'termEnd', label: 'Mwisho wa kipindi', type: 'date' },
        { k: 'status', label: 'Hali', type: 'select', options: ['Yupo madarakani', 'Amemaliza muda'] },
        { k: 'duties', label: 'Majukumu', type: 'textarea' },
      ],
      onSubmit: (v) => {
        if (!v['memberId'] && !v['name']) return 'Chagua mwanachama au andika jina.';
        return this.s.save('cabinet', cur.id, { ...v, name: v['memberId'] ? '' : v['name'] });
      },
    });
  }

  meetingForm(mt?: Meeting) {
    const isNew = !mt;
    const cur: Partial<Meeting> = mt || {};
    this.ui.openForm({
      title: isNew ? 'Rekodi kikao' : 'Hariri kikao',
      values: { date: todayISO(), kind: MEET_KINDS[0], attendees: [], ...cur },
      fields: [
        { k: 'title', label: 'Kichwa cha kikao', required: true, ph: 'mf. Kikao cha robo ya tatu 2026' },
        { k: 'kind', label: 'Aina', type: 'select', options: MEET_KINDS },
        { k: 'date', label: 'Tarehe', type: 'date', required: true },
        { k: 'venue', label: 'Mahali' },
        { k: 'chair', label: 'Mwenyekiti wa kikao' },
        { k: 'secretary', label: 'Katibu wa kikao' },
        { k: 'agenda', label: 'Ajenda', type: 'textarea', ph: 'Ajenda moja kwa kila mstari' },
        { k: 'attendees', label: 'Wahudhuriaji', type: 'multi', options: this.s.memberOptions(false) },
        { k: 'resolutions', label: 'Maazimio', type: 'textarea', ph: 'Azimio moja kwa kila mstari' },
        { k: 'minutes', label: 'Muhtasari wa kikao', type: 'textarea' },
        { k: 'nextDate', label: 'Kikao kijacho', type: 'date' },
      ],
      onSubmit: (v) => this.s.save('meetings', cur.id, v),
    });
  }

  noticeForm(n?: Notice) {
    const isNew = !n;
    const cur: Partial<Notice> = n || {};
    this.ui.openForm({
      title: isNew ? 'Toa taarifa mpya' : 'Hariri taarifa',
      values: { date: todayISO(), pinned: 'hapana', ...cur },
      fields: [
        { k: 'title', label: 'Kichwa', required: true },
        { k: 'date', label: 'Tarehe', type: 'date' },
        { k: 'pinned', label: 'Ibandikwe juu?', type: 'select', options: [['hapana', 'Hapana'], ['ndiyo', 'Ndiyo']] },
        { k: 'body', label: 'Maelezo', type: 'textarea', required: true },
      ],
      onSubmit: (v) => this.s.save('notices', cur.id, v),
    });
  }

  ledgerForm(x?: LedgerEntry) {
    const isNew = !x;
    const cur: Partial<LedgerEntry> = x || {};
    this.ui.openForm({
      title: isNew ? 'Ingiza mapato au matumizi mengine' : 'Hariri kumbukumbu',
      values: { date: todayISO(), dir: 'out', ...cur },
      fields: [
        { k: 'dir', label: 'Aina', type: 'select', options: [['out', 'Matumizi'], ['in', 'Mapato']] },
        { k: 'date', label: 'Tarehe', type: 'date', required: true },
        { k: 'category', label: 'Kundi', ph: 'mf. Vifaa vya ofisi, Riba ya benki, Usafiri' },
        { k: 'amount', label: 'Kiasi', type: 'number', required: true },
        { k: 'approvedBy', label: 'Aliyeidhinisha' },
        { k: 'receipt', label: 'Namba ya risiti' },
        { k: 'note', label: 'Maelezo', full: true },
      ],
      onSubmit: (v) => {
        if (!(Number(v['amount']) > 0)) return 'Weka kiasi.';
        return this.s.save('ledger', cur.id, { ...v, amount: Number(v['amount']) });
      },
    });
  }

  aboutForm() {
    this.ui.openForm({
      title: 'Hariri taarifa za mfuko',
      values: { ...this.s.about() },
      fields: [
        { k: 'intro', label: 'Utangulizi', type: 'textarea' },
        { k: 'history', label: 'Historia ya mfuko', type: 'textarea' },
        { k: 'goals', label: 'Malengo', type: 'textarea', ph: 'Lengo moja kwa kila mstari' },
        { k: 'rules', label: 'Kanuni na taratibu', type: 'textarea', ph: 'Kanuni moja kwa kila mstari' },
        { k: 'contact', label: 'Mawasiliano ya ofisi ya mfuko', type: 'textarea' },
      ],
      onSubmit: (v) => this.s.saveAbout(v),
    });
  }

  passwordForm(change: (cur: string, next: string) => Promise<unknown>) {
    this.ui.openForm({
      title: 'Badilisha neno la siri',
      fields: [
        { k: 'current', label: 'Neno la siri la sasa', type: 'password', required: true },
        { k: 'next', label: 'Neno jipya la siri (herufi 8+, likiwa na herufi na namba)', type: 'password', required: true },
      ],
      onSubmit: async (v) => {
        if (String(v['next']).length < 8 || !/[A-Za-z]/.test(String(v['next'])) || !/[0-9]/.test(String(v['next']))) return 'Neno la siri liwe na herufi 8 au zaidi, likiwa na herufi (a-z) na namba (0-9).';
        try {
          await change(v['current'], v['next']);
          this.ui.toast('Neno la siri limebadilishwa');
          return true;
        } catch (e: any) {
          return e?.error?.error || 'Neno la siri halikubadilishwa.';
        }
      },
    });
  }

  // ---------- maelezo ----------
  eventDetail(id: string) {
    const e = this.s.events().find((x) => x.id === id);
    if (e) this.ui.openComponent(`${e.kind || 'Tukio'} · ${this.s.mname(e.memberId)}`, EventDetailComponent, { id });
  }
  loanDetail(id: string) {
    const l = this.s.loans().find((x) => x.id === id);
    if (l) this.ui.openComponent(`Mkopo ${l.no} · ${this.s.mname(l.memberId)}`, LoanDetailComponent, { id });
  }
  projectDetail(id: string) {
    const p = this.s.projects().find((x) => x.id === id);
    if (p) this.ui.openComponent(p.name, ProjectDetailComponent, { id });
  }
  meetingDetail(id: string) {
    const m = this.s.meetings().find((x) => x.id === id);
    if (m) this.ui.openComponent(m.title || m.kind || 'Kikao', MeetingDetailComponent, { id });
  }

  payLabel(p: { type: string; month?: number; year?: number }) {
    return p.type === 'mwezi' ? `${PAY_TYPES['mwezi']} · ${MONTHS_FULL[(p.month || 1) - 1]} ${p.year}` : PAY_TYPES[p.type] || p.type;
  }
}
