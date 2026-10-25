# Dependency decisions

Prepared against publisher information retrieved on **October 22, 2026**.

| Component | Pin | Reason |
| --- | --- | --- |
| Angular framework packages | 22.2.3 | Current stable framework package retrieved from npm metadata. |
| Angular CLI and build | 22.2.4 | Current stable tooling release; same major/minor as the framework. |
| TypeScript | 6.0.3 | Within the Angular 22 compiler's supported 6.0 range. Do not install the newer TypeScript 7 major here. |
| RxJS | 7.8.2 | Stable supported RxJS line. |
| Jest / jest-environment-jsdom | 30.5.2 | Matching Jest runner and environment versions. |
| jest-preset-angular | 17.0.3 | Its publisher manifest supports Angular >=20 <23, Jest 30, and TypeScript >=5.8. |
| jsdom | 28.1.0 | Version used by the preset publisher's current development setup. |
| Node | 24.15+ on the 24 line | Compatible Angular 22 runtime; Codespaces installs Node 24. |

Direct dependencies are pinned. Transitive dependencies become reproducible after the first successful `npm run setup` generates `package-lock.json`; commit that lockfile. An npm-installed lockfile was not available in the assembly environment, so one was not fabricated.

## Primary references

- Angular release schedule: https://angular.dev/reference/releases
- Angular framework npm metadata: https://registry.npmjs.org/@angular/core/latest
- Angular CLI releases: https://github.com/angular/angular-cli/releases
- Angular version compatibility: https://angular.dev/reference/versions
- Template control flow: https://angular.dev/guide/templates/control-flow
- Zoneless applications: https://angular.dev/guide/zoneless
- Jest Angular installation: https://thymikee.github.io/jest-preset-angular/docs/getting-started/installation
- Zoneless Jest TestBed setup: https://thymikee.github.io/jest-preset-angular/docs/getting-started/testbed-environment
- Preset publisher's manifest and peers: https://github.com/thymikee/jest-preset-angular/blob/main/package.json

These references informed configuration; they are **not** a substitute for executing this repository's verification gate. The current upstream `main` branch and npm `latest` tags may change after this delivery; use the pins in package.json and the generated lockfile for an interview session.
