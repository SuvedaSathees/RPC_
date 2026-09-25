import { lazy, Suspense, type ComponentType } from "react";
export default function dynamic<P extends object>(loader: () => Promise<unknown>) {
  const L = lazy(async () => {
    const m = (await loader()) as { default?: ComponentType<P> } | ComponentType<P>;
    return { default: (typeof m === "function" ? m : (m as { default: ComponentType<P> }).default) as ComponentType<P> };
  });
  return function Dyn(props: P) {
    return <Suspense fallback={null}><L {...props} /></Suspense>;
  };
}
