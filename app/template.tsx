/**
 * Moving between pages: the new page simply appears, with no covering screen
 * and no effect. (The home page's own loading screen, on arrival and after a
 * refresh, belongs to its hero: components/home4/MonsoonHero.tsx.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
