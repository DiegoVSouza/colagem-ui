# Verify 002

- [x] New tests red before, green after (`artifacts/evidence/flow-modal-002/red.txt`: 4 failed; `green.txt`: exit 0)
- [x] `check_full` exit 0 (`artifacts/evidence/flow-modal-002/check-full.txt`)
- [x] Tarball 0.4.5 packed with SHA-256 and commit (`artifacts/package.json`, dirty false)
- [x] Adopted and tested in P07 (`e2e/flow-modal.spec.ts` at 1280 and 390 px, with axe); hosted CI green on both repositories
