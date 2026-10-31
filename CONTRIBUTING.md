# Contributing

[English](#english) · [Português (Brasil)](#português-brasil)

---

## English

Anyone can add a template to the public catalog with a pull request. This is the whole path; there is no submission form in the dashboard.

### 1. Fork and create a folder
Fork the repository and add a folder named after the template id (lowercase letters, digits and hyphens, for example `discord-bot-tickets/`) with:

| File or folder | What it is |
|---|---|
| `vertracloud.template.yaml` | The manifest (id, version, inputs, services, outputs). `id` must equal the folder name. |
| the code, or `docker/` | A **code template** has its project in a folder (`source.path`, for example `src/`). An **image template** has `docker/Dockerfile` and what it copies (`source.context: docker`) **and** `source.image`, the origin image pinned by digest (`@sha256:...`). The context must be a sub-folder, not `.`. |
| `README.md`, `README.en.md`, `README.es.md` | The documentation shown on the template's page: what it is, what the wizard asks, what you get, first steps, known limits, license. `README.md` is pt-BR and is required; `en` and `es` are strongly recommended. |
| `docs/` with `_index.json` | Longer pages. `_index.json` lists them (`{"version":1,"pages":[{"id","title":{pt-br,en,es},"files":{pt-br,en,es}}]}`); `.md`, `.json`, `.txt` and images only. |
| `icon.svg` (or `icon.png`) | SVG up to 64 KB with no scripts, `<image>`, `<use>` or external references; PNG up to 256 KB. Use your own drawing, or the project's official logo **only** if its brand rules allow it, unmodified; write the origin and the rule in `ICONS.md`. |
| `release.yaml` (optional) | `security: true`, `changelog` (pt-br, en, es, up to 2000 characters), `author` (up to 80). |

Rules the validator enforces: no secret in `env` (use `{{secret:<n>}}`, `secrets` or a `secret` question), no `NODE_OPTIONS`, `LD_*`, `PORT`, `HOME`, `PATH`... in `env` (put what an image needs in the Dockerfile `ENV`), placeholders that point to a service or question that exists, `when` conditions that refer to an earlier question, `min_plan` as a real plan slug, `links.license` declared, every `FROM` pinned by digest, the image finishes as uid 1000, no `.env*` and no `.vertra/` in the folder.

Platform facts worth knowing before you write the manifest: the root file system is read-only and `/app` (a volume) is the only persistent disk; the app runs as uid 1000 with all capabilities dropped and `no-new-privileges`; **a binary with a file capability fails to exec** (copy it with `cat > file`); the build needs network only for registries and sources you name.

### 2. Validate and test before the pull request
```bash
npm ci
node scripts/validate.mjs <folder>     # schema, placeholders, plan slugs, folder rules (no Docker needed)
./scripts/image-check.sh <folder>      # image templates: builds docker/ and scans it for file capabilities (needs Docker)
```

You can also create the template as **private on your own account** (`vertra template validate` for the manifest, then use it for real): it runs on the same engine as the public ones.

### 3. Open the pull request
The CI validates every template, then builds the image and scans it for file capabilities (**any hit fails**), and checks the declared license.

### 4. Review by Vertra Cloud
The Vertra Cloud team runs the template on the platform before merging. Security (no miner, hidden telemetry or secret in code), a license compatible with public distribution, brand rules respected, and the quality of the README. Open-source software only: a public template is always open code.

### 5. Merge
On merge the CI packs the folder as a version of the template and uploads it to the catalog bucket; the platform pulls it on a schedule. The template appears with the **Community** badge and your name (`release.yaml` > `author`). Nobody depends on your account.

### 6. New versions
A new version is a new pull request that raises `version` (semver). A published version is immutable: the same version with different content is refused.

Do not mention other hosting products in a template's text. Do not copy trademarks you have no right to use.

---

### For maintainers: what protects the catalog

A merge on `main` publishes to the catalog. Keep these repository settings on:

- `main` is protected: pull request required, no direct push, the `validate` check green and a review from a code owner (`.github/CODEOWNERS`).
- Only templates listed with `"origin": "vertra"` in `catalog.json` get the official badge; every other template is published as **Community**.
- The `catalog` environment has required reviewers from the Vertra Cloud team: the publish job waits for a manual approval.
- Run the sandbox tests before approving the publish.

## Português (Brasil)

Qualquer pessoa pode propor um template ao catálogo público por pull request. Este é o caminho todo; não há formulário no painel.

### 1. Fork e pasta nova
Faça um fork e crie uma pasta com o id do template (letras minúsculas, dígitos e hífens, por exemplo `discord-bot-tickets/`) com:

| Arquivo ou pasta | O que é |
|---|---|
| `vertracloud.template.yaml` | O manifesto (id, versão, perguntas, serviços, saídas). O `id` precisa ser igual ao nome da pasta. |
| o código, ou `docker/` | **Template de código**: o projeto numa pasta (`source.path`, por exemplo `src/`). **Template de imagem**: `docker/Dockerfile` e o que ele copia (`source.context: docker`) **e** `source.image`, a imagem de origem fixada por digest (`@sha256:...`). O contexto precisa ser uma subpasta, não `.`. |
| `README.md`, `README.en.md`, `README.es.md` | A documentação da página do template: o que é, o que o assistente pergunta, o que você recebe, primeiros passos, limites conhecidos, licença. `README.md` é pt-BR e obrigatório; `en` e `es` são muito recomendados. |
| `docs/` com `_index.json` | Páginas mais longas. O `_index.json` as lista (`{"version":1,"pages":[{"id","title":{pt-br,en,es},"files":{pt-br,en,es}}]}`); só `.md`, `.json`, `.txt` e imagens. |
| `icon.svg` (ou `icon.png`) | SVG até 64 KB, sem scripts, `<image>`, `<use>` nem referências externas; PNG até 256 KB. Use um desenho seu, ou o logo oficial do projeto **só** se as regras de marca permitirem, sem alterações; registre a origem e a regra no `ICONS.md`. |
| `release.yaml` (opcional) | `security: true`, `changelog` (pt-br, en, es, até 2000 caracteres), `author` (até 80). |

Regras que o validador aplica: nenhum segredo no `env` (use `{{secret:<n>}}`, `secrets` ou uma pergunta `secret`), sem `NODE_OPTIONS`, `LD_*`, `PORT`, `HOME`, `PATH`... no `env` (o que a imagem precisa vai no `ENV` do Dockerfile), placeholders que apontam para serviço ou pergunta que existe, `when` que cita uma pergunta anterior, `min_plan` com slug de plano real, `links.license` declarado, todo `FROM` fixado por digest, a imagem termina como uid 1000, sem `.env*` nem `.vertra/` na pasta.

O que vale saber da plataforma antes de escrever o manifesto: a raiz é somente leitura e o `/app` (um volume) é o único disco persistente; o app roda como uid 1000 sem capabilities e com `no-new-privileges`; **binário com file capability não executa** (copie-o com `cat > arquivo`); o build só precisa de rede para os registros e fontes que você citar.

### 2. Validar e testar antes do PR
```bash
npm ci
node scripts/validate.mjs <pasta>      # schema, placeholders, slugs de plano, regras da pasta (sem Docker)
./scripts/image-check.sh <pasta>       # template de imagem: builda o docker/ e varre file capabilities (precisa de Docker)
```

Você também pode criar o template como **privado na sua conta** (`vertra template validate` para o manifesto, depois usar de verdade): ele roda no mesmo motor dos públicos.

### 3. Abrir o PR
A CI valida todos os templates, depois builda a imagem e varre file capabilities (**qualquer achado reprova**), e confere a licença declarada.

### 4. Revisão da Vertra Cloud
A equipe da Vertra Cloud roda o template na plataforma antes do merge. Segurança (sem minerador, telemetria escondida ou segredo no código), licença compatível com distribuição pública, regras de marca respeitadas e qualidade do README. Só software aberto: template público é sempre código aberto.

### 5. Merge
No merge a CI empacota a pasta como uma versão do template e a envia ao bucket do catálogo; a plataforma a puxa em intervalos. O template aparece com o selo **Comunidade** e o seu nome (`release.yaml` > `author`). Ninguém depende da sua conta.

### 6. Versões novas
Versão nova é um PR novo que sobe a `version` (semver). Versão publicada é imutável: a mesma versão com conteúdo diferente é recusada.

Não cite outros produtos de hospedagem nos textos do template. Não copie marcas que você não tem direito de usar.

### Para mantenedores: o que protege o catálogo

Um merge na `main` publica no catálogo. Mantenha estas configurações do repositório ligadas:

- A `main` é protegida: pull request obrigatório, sem push direto, o check `validate` verde e revisão de um code owner (`.github/CODEOWNERS`).
- Só template listado com `"origin": "vertra"` no `catalog.json` ganha o selo oficial; todo o resto é publicado como **Comunidade**.
- O ambiente `catalog` tem revisores obrigatórios do time da Vertra Cloud: o job de publicação espera uma aprovação manual.
- Rode os testes no sandbox antes de aprovar a publicação.
