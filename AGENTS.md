# Repository Guidance

- `terminal-portfolio/` is the deployed vanilla TypeScript/Vite portfolio. Run its commands from that directory; GitHub Actions builds its `dist/` directory and syncs it to S3 on pushes to `main`.
- `legacy-grid-portfolio/` archives the previous webpack portfolio. Its generated `dist/` directory is ignored and it must not be used for deployment.
- Keep terminal commands deterministic and browser-only. Do not introduce shell execution or a backend.
- Preserve keyboard navigation, selectable terminal output, and URL routes when changing terminal interactions.
- Check both desktop and mobile layouts. The terminal must fit a 320px-wide viewport and use `dvh`-aware sizing so the command input remains reachable on mobile browsers.
