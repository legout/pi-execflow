# Contributing to `pi-execflow`

Thanks for contributing.

`pi-execflow` is a Pi package that bundles:

- prompt templates under `prompts/`
- execution, tracker, and planning skills under `skills/`
- bootstrap artifacts under `execflow/`
- a deterministic model sync script under `scripts/`

## Development workflow

### 1. Edit package resources

Most day-to-day changes will be in:

- `prompts/`
- `skills/`
- `execflow/`
- `README.md`
- `package.json`

### 2. Update model-role config when needed

Model assignments are sourced from:

- `execflow/settings.yml`

After editing that file, sync prompt frontmatter with:

```bash
npm run setup-models
```

This rewrites mapped `prompts/*.md` files deterministically.

### 3. Verify prompt/skill consistency

Before opening a PR, check:

- prompts referenced in docs actually exist
- skills referenced by prompts are packaged
- `execflow/settings.yml` matches the intended model-role split

## Design boundaries

Please preserve these package boundaries unless the change intentionally expands scope:

- delegated `/execflow` / `/execflow-queue` is documented as a `tk`-oriented path
- `br` support is primarily through `create-issues` and the manual local execution prompts
- `execflow/settings.yml` is the source of truth for prompt-model assignments in this package repo
- `/sync-models` is the supported way to rewrite prompt frontmatter

## Release expectations

When making user-visible changes:

- update `README.md` if commands, workflow, or install steps change
- update `CHANGELOG.md`
- keep examples and package metadata aligned with reality

## Commit style

Use concise Conventional Commits-style subjects, for example:

- `feat(prompts): add tracker-neutral work-item setup`
- `fix(models): sync review role mapping`
- `docs(readme): clarify br execution path`

## Local install testing

You can test the package locally with:

```bash
pi install /absolute/path/to/pi-execflow
```

or for one-off use:

```bash
pi -e /absolute/path/to/pi-execflow
```
