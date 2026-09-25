export const usePathname = () => "/";
export const useRouter = () => ({ push: () => {}, replace: () => {} });
export const notFound = () => { throw new Error("not found"); };
