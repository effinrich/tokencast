## Learned User Preferences

- For UI overhauls, prefer foundation-first work (design tokens in `app/app.css` and shared primitives in `app/components/ui/`) before refactoring screens, not incremental ui-score fix lists.
- Use ui-score against StyleSeed design language to diagnose UI debt; treat the report as constraints for a new system, not a line-edit todo list.

## Learned Workspace Facts

- Stack: React Router 8, React 19, Tailwind CSS v4, TypeScript.
- Design tokens live in `app/app.css` via `@theme`; UI primitives are exported from `app/components/ui/` (Page, Card, Button, Input, Link).
- Main app UI is `app/components/token-workbench.tsx`; `home` and `share` routes render it.
- Docs route is `app/routes/docs.tsx` with prose layout on the same token/primitive foundation.
- Live theme sandbox in `app/components/live-theme-sandbox.tsx` previews pasted tokens inside TokenWorkbench.
