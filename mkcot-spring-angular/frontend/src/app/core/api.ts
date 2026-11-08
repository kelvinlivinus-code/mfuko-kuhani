import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

/**
 * Anwani ya backend. Kwa kawaida ni "/api" (nginx au "ng serve" inaipeleka kwa Spring Boot).
 * Kama frontend na backend ziko kwenye seva tofauti, weka window.MKCOT_API kwenye public/config.js.
 */
export const API: string = ((window as any).MKCOT_API || '/api').replace(/\/$/, '');
export const TOKEN_KEY = 'mkcot-token';

/** Inaongeza tokeni ya mtumiaji kwenye kila ombi la API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  if (token && req.url.startsWith(API)) {
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  }
  return next(req);
};

/** Ujumbe wa kosa unaoeleweka kwa mtumiaji. */
export function errMsg(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'Haikuhifadhiwa. Angalia mtandao kisha jaribu tena.';
    if (e.error && typeof e.error === 'object' && e.error.error) return String(e.error.error);
    if (e.status === 403) return 'Huna ruhusa ya kufanya hivi kwa nafasi yako. Mwombe msimamizi.';
    if (e.status === 401) return 'Ingia kwanza.';
  }
  return 'Haikuhifadhiwa. Angalia mtandao kisha jaribu tena.';
}
