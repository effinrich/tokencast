import type { Route } from "./+types/home";
import { TokenWorkbench } from "../components/token-workbench";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tokencast" },
    {
      name: "description",
      content: "Paste your design tokens, get a live preview and exportable theme code.",
    },
  ];
}

export default function Home() {
  return <TokenWorkbench />;
}
