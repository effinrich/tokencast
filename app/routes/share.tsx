import { Card, Link, Page } from "~/components/ui";
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
      <div className="flex min-h-screen flex-col bg-canvas text-primary">
        <Page className="flex max-w-lg flex-1 flex-col items-center justify-center py-16 text-center">
          <Card className="w-full space-y-4">
            <p className="font-mono text-sm text-muted">404</p>
            <h1 className="text-xl font-semibold">No share found for &quot;{slug}&quot;</h1>
            <p className="text-sm text-secondary">
              This link may have expired or never existed.
            </p>
            <Link href="/">Back to Tokencast</Link>
          </Card>
        </Page>
      </div>
    );
  }

  return <TokenWorkbench initialModel={model} readOnlyBanner={`Viewing a shared conversion (${slug})`} />;
}
