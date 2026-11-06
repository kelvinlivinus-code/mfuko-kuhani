/** Miundo ya kumbukumbu: majina ya sehemu ni yale yale ya backend na ya nakala (backup) ya zamani. */
export interface Rec {
  id: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  [k: string]: any;
}
export interface Dependant { name: string; relation?: string; dob?: string; alive?: string }
export interface Member extends Rec {
  no?: string; rank?: string; name: string; armyNo?: string; unit?: string; phone?: string; joinDate?: string;
  status?: string; usaili?: string; usailiDate?: string; address?: string; kin?: string; kinPhone?: string;
  deps?: Dependant[]; notes?: string;
}
export interface Payment extends Rec {
  memberId?: string; type: string; year?: number; month?: number; amount: number; date?: string; receipt?: string; note?: string;
}
export interface SupportEvent extends Rec {
  memberId?: string; date?: string; kind?: string; relation?: string; person?: string; place?: string; amount: number;
  status?: string; payDate?: string; approvedBy?: string; receipt?: string; description?: string;
}
export interface Repayment { date?: string; amount: number; receipt?: string; note?: string; at?: string }
export interface Loan extends Rec {
  no?: string; memberId?: string; date?: string; principal: number; rate?: number | null; months?: number;
  guarantor?: string; purpose?: string; note?: string; repayments?: Repayment[];
}
export interface ProjectEntry { kind: string; date?: string; amount: number; note?: string }
export interface Project extends Rec {
  name: string; status?: string; startDate?: string; lead?: string; budget?: number | null; description?: string; entries?: ProjectEntry[];
}
export interface CabinetMember extends Rec {
  position?: string; memberId?: string; name?: string; phone?: string; termStart?: string; termEnd?: string; status?: string; duties?: string;
}
export interface Meeting extends Rec {
  title?: string; kind?: string; date?: string; venue?: string; chair?: string; secretary?: string; agenda?: string;
  attendees?: string[]; resolutions?: string; minutes?: string; nextDate?: string;
}
export interface Notice extends Rec { title: string; date?: string; pinned?: string; body?: string }
export interface LedgerEntry extends Rec {
  dir: 'in' | 'out'; date?: string; category?: string; amount: number; approvedBy?: string; receipt?: string; note?: string;
}
export interface Settings {
  fundName: string; branch: string; entryFee: number; monthlyFee: number; interestRate: number;
  openingBalance: number; openingDate: string | null; hasLogo: boolean; logoVersion: number;
}
export interface About { intro?: string; history?: string; goals?: string; rules?: string; contact?: string }
export interface AppUser {
  id: string; email: string; fullName?: string; role: string; memberId?: string | null; createdAt?: string;
}
