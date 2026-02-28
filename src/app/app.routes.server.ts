import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * @description
 * In questo file decidiamo quali pagine devono essere preparate dal server (Prerender)
 * e quali devono essere create al volo nel browser (Client).
 * Siccome il nostro è un pannello privato che ha bisogno del login, la maggior parte
 * delle pagine verrà creata solo dopo che l'utente è entrato.
 */
export const serverRoutes: ServerRoute[] = [
  // Prepariamo in anticipo solo le pagine pubbliche
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'recover-password',
    renderMode: RenderMode.Prerender
  },
  // Tutte le altre pagine (Dashboard, Records, ecc.) vengono caricate nel browser
  // Questo evita errori di build perché quelle pagine sono dinamiche e dipendono dall'utente.
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
