# pqax.tools

The web reader of PQAX, the file format for the storage footprint of Parquet and Delta tables. Open a `.pqax` file, or a `.vpax` file that embeds one, in the browser and see where the storage goes: nothing is uploaded.

The site is built from the npm packages `@pqax/pqax` and `@pqax/views`, published from the [pqax-org/pqax](https://github.com/pqax-org/pqax) repository, where the format, the conformance kit, and the implementations live. This repository holds only the page and the build: it does not use the sources of pqax-org/pqax.

## What is here

| Path | Content |
|---|---|
| `index.html` | The page: the file picker, the collection line, and the three storage views. Its import map loads the two packages from `lib/`. |
| `scripts/build.mjs` | Copies `index.html`, the `assets/` folder when there is one, and the `dist` folders and the views' `styles.css` from `node_modules` into `_site/`. |
| `scripts/serve.mjs` | Serves `_site/` on `127.0.0.1`, to try the page locally. |
| `package.json` | The two packages, pinned to exact versions. |
| `.github/workflows/pages.yml` | Builds `_site/` and deploys it to GitHub Pages on every push to `main`. |

`_site/` and `node_modules/` are not committed.

## Run it locally

With Node.js 24:

```bash
npm ci
npm run build
npm run serve
```

Then open `http://127.0.0.1:8080/`. A browser does not run ES modules from a file on disk, so the page needs a server. `npm run serve -- _site 8081` picks another port.

## Update to a new release

The site follows the releases of the two packages. To move to a new release:

1. Bump `@pqax/pqax` and `@pqax/views` to the new version in `package.json`, both exact and both the same version.
2. Run `npm install` to update `package-lock.json`, then `npm run build` and `npm run serve` to check the page.
3. Commit and push to `main`. The workflow deploys the site.

## Hosting

| Setting | Value |
|---|---|
| DNS | The apex domain `pqax.tools` points at GitHub Pages, with the `A` and `AAAA` records that GitHub documents for an apex domain. |
| GitHub Pages | Repository settings, Pages: source "GitHub Actions", custom domain `pqax.tools`, "Enforce HTTPS" on. There is no `CNAME` file. |

## License

MIT, see [LICENSE](LICENSE). PQAX is a project of [SQLBI](https://www.sqlbi.com/).
