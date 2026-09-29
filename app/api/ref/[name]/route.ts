// TEMPORARY — serves reference frames to the Flow tab during film production. Delete this folder afterwards.
import fs from "fs";
import path from "path";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Private-Network": "true",
};

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const safe = path.basename(name);
  const file = path.join(process.cwd(), "public", "refs", safe);
  if (!fs.existsSync(file)) return new Response("not found", { status: 404, headers: cors });
  return new Response(fs.readFileSync(file), { headers: { ...cors, "Content-Type": "image/jpeg" } });
}
