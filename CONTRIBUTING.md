# Contributing

Thanks for taking the time to improve itsjan.dev.

## Before opening a pull request

For substantial visual, content, or architectural changes, open an issue first.
This is a personal portfolio, so changes to personal information or the visual
direction may be declined even when the implementation is sound.

Bug fixes, accessibility improvements, documentation corrections, and focused
performance improvements are welcome.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `bun install`.
3. Make a focused change.
4. Add or update tests when behavior changes.
5. Run `bun run ci`.
6. Open a pull request with a concise explanation and screenshots for visual changes.

Do not commit `.env`, credentials, analytics secrets, build output, or editor
configuration.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(portfolio): add a project card
fix(accessibility): restore focus after closing the avatar
docs: clarify local setup
```

## Code style

- Keep browser code typed and avoid `@ts-nocheck`.
- Prefer shared constants and data modules over repeated profile information.
- Preserve keyboard access and reduced-motion behavior.
- Keep third-party resources local unless a runtime integration requires a request.
- Let Prettier handle formatting; do not hand-align code.

By contributing, you agree that your contribution is licensed under the MIT
License included in this repository.
