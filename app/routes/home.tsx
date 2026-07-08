import type { Route } from "./+types/home";
import { TokenWorkbench } from "../components/token-workbench";
import { parseAndValidateShareRequest, ShareValidationError } from "../lib/tokens/validate-model";
import { createShare, ShareRateLimitError, SharePersistError } from "../lib/tokens/share.server";
import { getClientIp } from "../lib/get-client-ip";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tokencast" },
    {
      name: "description",
      content: "Paste your design tokens, get a live preview and exportable theme code.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawModel = formData.get("model");

  if (typeof rawModel !== "string") {
    return { ok: false as const, error: "Missing token model in request." };
  }

  try {
    const model = parseAndValidateShareRequest(rawModel);
    const slug = await createShare(model, getClientIp(request));
    return { ok: true as const, slug };
  } catch (err) {
    if (err instanceof ShareValidationError) return { ok: false as const, error: err.message };
    if (err instanceof ShareRateLimitError) return { ok: false as const, error: err.message };
    if (err instanceof SharePersistError) return { ok: false as const, error: err.message };
    throw err;
  }
}

export default function Home() {
  return <TokenWorkbench />;
}
