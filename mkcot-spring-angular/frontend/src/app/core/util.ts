/** Vitendakazi vidogo vya kuonyesha fedha na tarehe. */
export const tsh = (n: unknown) => 'TSh ' + Math.round(Number(n) || 0).toLocaleString('en-US');
export const short = (v: unknown) => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M';
  if (Math.abs(n) >= 1e3) return Math.round(n / 1e3) + 'k';
  return String(Math.round(n));
};
export const pad = (n: number) => String(n).padStart(2, '0');
export const todayISO = () => {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};
export const fmtD = (s: unknown) => {
  if (!s) return '—';
  const [y, m, d] = String(s).split('-');
  return d ? `${d.slice(0, 2)}/${m}/${y}` : String(s);
};
export const yearOf = (s: unknown) => (s ? Number(String(s).slice(0, 4)) : null);
export const addMonths = (iso: string | null | undefined, n: unknown) => {
  if (!iso || !n) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + Number(n), d);
  return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
};
export const byDateDesc = (a: { date?: string | null }, b: { date?: string | null }) =>
  String(b.date || '').localeCompare(String(a.date || ''));
export const lines = (t: string | null | undefined) =>
  (t || '').split('\n').map((s) => s.trim()).filter(Boolean);
export const statusCls = (s?: string | null) => (s === 'Hai' || !s ? 'ok' : s === 'Amefariki' ? 'bad' : 'warn');
export const loanCls = (s: string) => (s === 'Umelipwa' ? 'ok' : s === 'Umechelewa' ? 'bad' : 'brass');
export const projCls = (s?: string | null) =>
  s === 'Inaendelea' ? 'brass' : s === 'Imekamilika' ? 'ok' : s === 'Imesitishwa' ? 'bad' : '';
