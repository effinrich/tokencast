import { Form, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tokencast" },
    {
      name: "description",
      content: "Paste your design tokens, get a live preview and exportable theme code.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return { greeting: "Tokencast is warming up." };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const echo = formData.get("echo");
  return { echo: typeof echo === "string" ? echo : null };
}

export default function Home() {
  const { greeting } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main>
      <h1>Tokencast</h1>
      <p>{greeting}</p>
      <p>Paste your design tokens, get a live preview and exportable theme code. In progress.</p>

      {/*
        action="/?index" disambiguates this index route's action from its parent
        ("root") for plain, non-JS document POSTs. React Router's hydrated <Form>
        appends this automatically for JS-driven submits; a raw HTTP POST (curl,
        a client with JS disabled) needs it explicit. See:
        https://reactrouter.com/en/main/guides/index-search-param
      */}
      <Form method="post" action="/?index">
        <label htmlFor="echo">Framework-mode smoke test (loader + action)</label>
        <input id="echo" name="echo" defaultValue="framework mode works" />
        <button type="submit">Submit</button>
      </Form>
      {actionData?.echo ? <p data-testid="echo-result">Action echoed: {actionData.echo}</p> : null}
    </main>
  );
}
