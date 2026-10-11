/**
 * The WhatsApp message that asks for today's rates, shared by the server
 * (one product's link, a job's link) and the browser (the rate list), with no
 * product data in it, so the page's script stays small.
 */
export function rateMessage(names: readonly string[]) {
  return names.length === 1
    ? `Hello RPC Constructions, please share today's rate for ${names[0]}.`
    : `Hello RPC Constructions, please share today's rates for: ${names.join("; ")}.`;
}
export const rateHref = (whatsapp: string, names: readonly string[]) => `${whatsapp}?text=${encodeURIComponent(rateMessage(names))}`;
