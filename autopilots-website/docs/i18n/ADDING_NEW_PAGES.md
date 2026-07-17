# Adding new pages

1. Build the Dutch page with shared components.
2. Add a stable family and six slugs to `src/i18n/routes.ts`.
3. Add all locale copy to the relevant central i18n module; never duplicate templates.
4. Route the family through `LocalizedDutchRoute` and `LocalizedRoutePage`.
5. Use `localizedPath` for every internal link and provide localized metadata.
6. Run build, tests and `pnpm run i18n:audit:full`.
7. Record native-speaker review; legal copy also needs legal approval.
