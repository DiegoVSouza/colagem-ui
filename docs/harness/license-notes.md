# License notes

`colagem-ui` is MIT.

`elkjs` 0.12.1 is licensed `EPL-2.0 OR GPL-3.0-or-later`. It is used only by `src/layout.ts`, the build-time entry exported as `colagem-ui/layout`. It is a dev dependency and an optional peer dependency. It is never part of `dist/index.js` or of any browser bundle: `scripts/budget.mjs` fails the build if `index.js` or any shared chunk mentions it. Consumers who call `layoutFlow` install `elkjs` themselves, in their build tooling only.
