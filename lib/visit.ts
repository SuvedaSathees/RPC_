/**
 * What this browser tab has seen since the site was last loaded. Nothing is
 * stored anywhere: a refresh starts afresh. So the home page opens on its
 * loading screen, at the top, on first arrival and after a refresh, and comes
 * back exactly where it was left when you return to it from another page.
 */
export const visit = {
  /** the home page has opened once, with its loading screen */
  homeShown: false,
  /** how far down each page was left, while moving between pages */
  scroll: new Map<string, number>(),
  /** when the browser's back or forward button was last used (ms, performance clock) */
  popAt: -Infinity,
};
