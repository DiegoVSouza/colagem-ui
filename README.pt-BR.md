# colagem-ui

<!-- case:start -->
## O case

- **Problema.** Um portfólio e um console precisam de uma só aparência, e uma afirmação de contraste não vale nada se só um teste unitário a fez.
- **Decisão.** Os tokens são o único lugar onde uma cor pode aparecer, os componentes leem tokens, e o contraste é conferido pelo axe em Chrome real nos dois temas, em viewport largo e estreito. Os diagramas são desenhados em SVG a partir de um layout calculado no build; o motor de layout (`elkjs`, EPL-2.0 OR GPL-3.0) é uma entrada separada que nunca chega ao `index.js`.
- **Medido.** 62 testes unitários, 9,5 KB gzip contra um orçamento de 40 KB (`npm run budget`), e `check_full.py` com exit 0 incluindo axe com contraste nos dois temas. O Chrome real achou cinco defeitos no 0.4.0 que o jsdom não via; estão listados em `docs/harness/progress.md`. Fonte: `artifacts/evidence/colagem-ui-040/check-full.txt`.
- **Como rodar.** `npm ci && python scripts/check_fast.py`, depois `npm run gallery`.
- **Limites.** O nível 2 (Three.js) vive no portfólio, não aqui. Não publicado no npm; os consumidores fixam um tarball por SHA-256.
- **Docs.** [Arquitetura](docs/architecture.md), [notas de licença](docs/harness/license-notes.md).
<!-- case:end -->

Tokens e componentes React do design system do lab, `DESIGN_SYSTEM_COLAGEM_URBANA_NOITE.md` (níveis 0 e 1), mais o `FlowDiagram` e um conjunto de blocos de conteúdo. Consumido por P06 e P07 como tarball fixado.

Consulte o README em inglês para o uso.
