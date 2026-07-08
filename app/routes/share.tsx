import type { Route } from "./+types/share";
import { loadShare } from "../lib/tokens/share.server";
import { TokenWorkbench } from "../components/token-workbench";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shared theme — Tokencast" },
    { name: "description", content: "A shared design-token conversion on Tokencast." },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const model = await loadShare(params.slug);
  return { model, slug: params.slug };
}

export default function Share({ loaderData }: Route.ComponentProps) {
  const { model, slug } = loaderData;

  if (!model) {
    return (
      <div className="flex flex-col min-h-screen bg-[#09090b] text-white items-center justify-center gap-4">
        <p className="text-sm font-mono text-white/60">404</p>
        <h1 className="text-xl font-semibold">No share found for "{slug}"</h1>
        <p className="text-white/60 text-sm">
          This link may have expired or never existed.
        </p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline text-sm">
          Back to Tokencast
        </a>
      </div>
    );
  }

  return <TokenWorkbench initialModel={model} readOnlyBanner={`Viewing a shared conversion (${slug})`} />;
}
