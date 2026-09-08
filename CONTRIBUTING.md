# Contributing

## Branches

- `main` is the production branch. Every push triggers the EAS production deployment workflow.
- `develop` is the integration branch for completed work before production.
- Create short-lived branches from `develop` using `feature/<name>`, `fix/<name>`, or `chore/<name>`.

## Workflow

1. Create a branch from `develop`.
2. Open a pull request back to `develop` and verify the change.
3. Merge `develop` into `main` through a pull request when the release is ready.
4. EAS publishes a compatible over-the-air update or creates and submits native builds when required.

Do not commit credentials, local environment files, or generated build artifacts.
