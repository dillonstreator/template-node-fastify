# Changesets

This repo is a starter template (not published to npm). [Changesets](https://github.com/changesets/changesets) versions the template, updates `CHANGELOG.md`, and creates GitHub Releases.

## Workflow

1. On a feature branch, record a changeset:

```sh
pnpm changeset
```

2. Open a PR. Merge as usual.

3. On `main`, the Release workflow opens or updates a **Version Packages** PR that bumps `package.json` and the changelog.

4. Merge **Version Packages**. The workflow tags the release and creates a GitHub Release (no npm publish).

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm changeset` | Create a changeset |
| `pnpm version-packages` | Apply changesets locally (`changeset version`) |
| `pnpm release` | Tag the current version for GitHub Releases |
