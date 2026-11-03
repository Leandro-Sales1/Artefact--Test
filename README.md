# Gerenciador de Tarefas · Task Manager — Next.js 15 + tRPC

🇧🇷 [Português](#-português) · 🇺🇸 [English](#-english)

---

## 🇧🇷 Português

Aplicação de gerenciamento de tarefas (CRUD) feita como desafio técnico.
É um monolito Next.js: o mesmo projeto contém o backend (tRPC, com as tarefas guardadas **em memória**) e o frontend (React com SSR), com interface em português e inglês.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · tRPC v11 · TanStack React Query v5 · Zod v4 · Tailwind CSS v4 · Vitest

### Como rodar

Requisitos: Node.js 22+ (testado no 24).

```bash
npm install
npm run dev      # http://localhost:3000
```

Produção:

```bash
npm run build
npm start
```

| Script | O que faz |
|---|---|
| `npm test` | Roda os testes unitários |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

> As tarefas ficam em memória: elas se perdem ao reiniciar o servidor.

### Funcionalidades

| Requisito | Onde está |
|---|---|
| Criar, listar, atualizar e excluir tarefas via tRPC | `src/controllers/task.controller.ts` |
| Não criar tarefa sem título | Schema Zod em `src/models/task.schema.ts`, validado no backend **e** no formulário |
| Erros significativos (ex.: atualizar tarefa inexistente → `NOT_FOUND`) | Controller + `errorFormatter` em `src/trpc/init.ts` |
| Listagem com SSR | `src/app/page.tsx` (Server Component chama o tRPC direto no servidor) |
| Excluir direto na lista, com feedback de sucesso/erro | `src/views/tasks/TaskItem.tsx` |
| Formulário de criação/edição com hooks e validação | `src/views/tasks/TaskForm.tsx` |
| Estados de carregamento, sucesso e falha | Botões "Salvando..."/"Excluindo...", mensagens de feedback, `error.tsx`, `not-found.tsx` |
| Interface e mensagens da API em português e inglês | `src/i18n/` + seletor PT/EN no topo da página |

#### Modelo da tarefa

| Enunciado | Código | Tipo |
|---|---|---|
| `id` | `id` | `string` (UUID, obrigatório, gerado pelo servidor) |
| `titulo` | `title` | `string` (obrigatório, até 100 caracteres) |
| `descricao` | `description` | `string` (opcional, até 500 caracteres) |
| `dataCriacao` | `createdAt` | `string` ISO 8601 (gerado pelo servidor) |

### Estrutura (MVC)

```
src/
├── app/                          # Rotas do Next.js: finas, só ligam os dados às Views
│   ├── api/trpc/[trpc]/route.ts  # Expõe o tRPC via HTTP em /api/trpc/*
│   ├── page.tsx                  # Listagem (SSR)
│   ├── tasks/new/page.tsx        # Criação
│   ├── tasks/[id]/edit/page.tsx  # Edição (SSR busca a tarefa pelo id; 404 se não existir)
│   ├── error.tsx · not-found.tsx
│   └── layout.tsx                # Layout + providers (idioma e tRPC)
├── models/                       # M — dados e regras
│   ├── task.schema.ts            # Tipo Task + schemas Zod (usados no front e no back)
│   └── task.model.ts             # "Banco" em memória + operações
├── controllers/                  # C — entrada da API
│   └── task.controller.ts        # Router tRPC: list, getById, create, update, delete
├── views/                        # V — componentes React
│   ├── tasks/TaskList.tsx · TaskItem.tsx · TaskForm.tsx
│   ├── components/Feedback.tsx · LanguageSwitcher.tsx
│   └── utils/errors.ts
├── i18n/                         # Internacionalização (pt-BR / en)
│   ├── config.ts                 # Idiomas suportados, idioma padrão, cookie
│   ├── dictionaries/             # pt-BR.ts (define o tipo Dictionary) e en.ts
│   ├── server.ts                 # getLocale() para Server Components
│   └── provider.tsx              # I18nProvider + hook useI18n() para Client Components
└── trpc/                         # Infraestrutura do tRPC
    ├── init.ts                   # initTRPC + contexto (idioma) + tradução dos erros
    ├── router.ts                 # appRouter (junta os controllers) + tipo AppRouter
    ├── server.ts                 # getServerApi(): caller para Server Components (SSR sem HTTP)
    ├── client.ts                 # Hooks do tRPC para Client Components
    └── provider.tsx              # Provider do tRPC + React Query
tests/unit/                       # Testes unitários (Vitest)
```

**Fluxo de uma requisição:** View (`trpc.task.delete.useMutation`) → HTTP `/api/trpc/task.delete` → Controller (valida a entrada com o schema e trata erros) → Model (altera os dados) → resposta tipada de volta para a View.

### API (tRPC)

Todas as procedures ficam em `/api/trpc/<procedure>`. Queries usam `GET` e mutations usam `POST`.

| Procedure | Tipo | Entrada | Erros |
|---|---|---|---|
| `task.list` | query | — | — |
| `task.getById` | query | `{ id }` | 400 (id ausente/inválido), 404 |
| `task.create` | mutation | `{ title, description? }` | 400 (título vazio/ausente) |
| `task.update` | mutation | `{ id, title, description? }` | 400, 404 |
| `task.delete` | mutation | `{ id }` | 400, 404 |

```bash
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H "content-type: application/json" -d '{"title":""}'
# → 400 {"error":{"message":"O título é obrigatório", ... "code":"BAD_REQUEST"}}

# Em inglês: envie o cookie de idioma
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H "content-type: application/json" -H "cookie: locale=en" -d '{"title":""}'
# → 400 {"error":{"message":"Title is required", ...}}
```

### Decisões técnicas

#### Arquitetura
- **Next.js 15, e não 16:** o enunciado pede "(v15)" e também "versões mais recentes". Usei a última versão 15.x (15.5).
- **MVC dentro do Next:** `app/` só define as rotas e liga os dados às Views. A regra de negócio fica em `models/`, a entrada da API em `controllers/` e os componentes em `views/`. Cada router do tRPC faz o papel de controller.
- **tRPC com a integração clássica `@trpc/react-query`:** os hooks (`trpc.task.delete.useMutation()`) são diretos e fáceis de ler. Os tipos vão do backend ao frontend sem gerar código, só com `type AppRouter`.
- **Nomes em inglês:** os campos do enunciado (`titulo`, `descricao`, `dataCriacao`) viraram `title`, `description` e `createdAt`, para seguir o padrão do restante do código. A tabela acima mostra a correspondência.

#### Identidade das tarefas
- **Toda operação usa só o `id`:** buscar, editar e excluir recebem apenas o `id`, tanto no front (`key`, link de edição, exclusão) quanto no back (`Map` indexado pelo `id`). Duas tarefas com o mesmo título nunca se confundem.
- **`id` obrigatório e gerado pelo servidor:** é um UUID criado com `crypto.randomUUID()` e validado com `z.uuid()`. O cliente não envia `id` na criação.
- **`id` e `createdAt` imutáveis:** o Zod descarta qualquer campo que não esteja no schema, então o update não consegue trocar o `id` nem a data de criação.

#### Validação e erros
- **Schema Zod compartilhado:** o mesmo `taskInputSchema` valida a API e o formulário, então as regras do front e do back nunca divergem. O formulário não chega a fazer a requisição quando os dados são inválidos.
- **Erros como chaves:** os schemas e o controller usam chaves (`"titleRequired"`, `"taskNotFound"`) no lugar de textos fixos. O `errorFormatter` do tRPC traduz essas chaves para o idioma da requisição, em vez de devolver o JSON cru do Zod.
- **Códigos HTTP corretos:** entrada inválida → 400 (`BAD_REQUEST`), tarefa inexistente → 404 (`NOT_FOUND`). Falhas de rede, quando a requisição nem chega ao servidor, viram uma mensagem amigável no front.

#### Dados e renderização
- **Store em `globalThis`:** mantém os dados entre hot-reloads no desenvolvimento e garante que o route handler e os Server Components usem a mesma instância.
- **SSR com server caller:** as páginas chamam `(await getServerApi()).task.list()` direto no servidor (`createCallerFactory`). Elas passam pelas mesmas validações do controller, sem uma requisição HTTP para a própria API.
- **`force-dynamic` na listagem:** sem isso, o Next pré-renderiza a página no build e a lista ficaria congelada.
- **Atualização depois das mutações:** depois de excluir, `router.refresh()` reexecuta o SSR, e o servidor continua sendo a única fonte de verdade. Se a tarefa já tinha sido removida em outra aba, o erro aparece e a lista também é atualizada. Depois de criar ou editar, o usuário volta para a lista com uma mensagem de sucesso (`?feedback=`), que é removida da URL em seguida.
- **Sem `loading.tsx` global:** com ele, a página começa a ser transmitida antes do `notFound()` e o 404 sai com status HTTP 200. Como a lista já chega pronta via SSR, os estados de carregamento ficam nos botões.
- **Datas sem superjson:** `createdAt` é uma string ISO, que trafega em JSON sem perda. A exibição usa um fuso fixo (`America/Sao_Paulo`) para o servidor e o navegador formatarem igual, sem erro de hidratação.

#### Internacionalização
- **Sem biblioteca extra:** dicionários tipados em `src/i18n/dictionaries/`. O `pt-BR.ts` define o formato (`Dictionary`), e o `en.ts` precisa seguir o mesmo formato, senão o TypeScript acusa erro. Textos com variáveis são funções, ex.: `t.taskItem.deleted(title)`.
- **Idioma no cookie `locale`:** o padrão é `pt-BR`. O seletor PT/EN grava o cookie e chama `router.refresh()`, e a página é renderizada de novo no servidor já no novo idioma, inclusive `<html lang>`, `<title>` e o formato da data. A API lê o mesmo cookie para traduzir os erros.
- **Uso:** Server Components usam `getDictionary(await getLocale())` e Client Components usam `const { t } = useI18n()`.
- **Novo idioma:** crie o dicionário, registre-o em `dictionaries/index.ts` e acrescente o código em `locales` (`config.ts`).

#### Testes
- **Só testes unitários, com Vitest:** rápidos (menos de 1 s) e sem precisar subir servidor nem navegador.
- **API testada sem servidor:** os handlers `GET`/`POST` do route handler recebem um `Request` direto, então os testes cobrem o caminho HTTP real (status, mensagens e idioma pelo cookie).
- **Isolamento:** o store em memória é limpo antes de cada teste.

| Arquivo | O que cobre |
|---|---|
| `task.schema.test.ts` | Regras do Zod: `id` obrigatório e UUID, título obrigatório, limites de tamanho, campos extras descartados |
| `task.model.test.ts` | Store em memória: ids únicos, ordenação, update/remove afetam só o `id` informado |
| `task.controller.test.ts` | Procedures via `createCaller`: CRUD por `id`, `BAD_REQUEST`, `NOT_FOUND`, `id` e `createdAt` imutáveis |
| `trpc-http.test.ts` | Route handler HTTP: status 200/400/404 e mensagens traduzidas pelo cookie de idioma |
| `i18n.test.ts` | Dicionários com as mesmas chaves, `translateError`, resolução do idioma pelo cookie |

### Limitações conhecidas

- Os dados ficam em memória: somem ao reiniciar e não são compartilhados entre várias instâncias (ex.: serverless). Para persistir, basta trocar a implementação de `task.model.ts`, sem mexer em controller ou views.
- O `npm audit` aponta vulnerabilidades em dependências de build: ESLint e o PostCSS que vem dentro do Next 15. A correção do PostCSS exige o Next 16, e o desafio pede a v15.

### Próximos passos

- Exclusão otimista e toasts.
- Status de "concluída", filtros e paginação.
- Hidratação do React Query (prefetch no servidor) no lugar de `router.refresh()`.
- Persistência real (ex.: Prisma + SQLite).

---

## 🇺🇸 English

Task management application (CRUD) built as a technical challenge.
It is a Next.js monolith: the same project holds the backend (tRPC, with tasks stored **in memory**) and the frontend (React with SSR), with the UI available in Portuguese and English.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · tRPC v11 · TanStack React Query v5 · Zod v4 · Tailwind CSS v4 · Vitest

### Getting started

Requirements: Node.js 22+ (tested on 24).

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

| Script | What it does |
|---|---|
| `npm test` | Runs the unit tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type checking |

> Tasks live in memory: they are lost when the server restarts.

### Features

| Requirement | Where |
|---|---|
| Create, list, update and delete tasks through tRPC | `src/controllers/task.controller.ts` |
| No task without a title | Zod schema in `src/models/task.schema.ts`, validated on the backend **and** in the form |
| Meaningful errors (e.g. updating a missing task → `NOT_FOUND`) | Controller + `errorFormatter` in `src/trpc/init.ts` |
| Server-side rendered list | `src/app/page.tsx` (Server Component calls tRPC directly on the server) |
| Delete from the list, with success/error feedback | `src/views/tasks/TaskItem.tsx` |
| Create/edit form with hooks and validation | `src/views/tasks/TaskForm.tsx` |
| Loading, success and failure states | "Saving..."/"Deleting..." buttons, feedback messages, `error.tsx`, `not-found.tsx` |
| UI and API messages in Portuguese and English | `src/i18n/` + PT/EN switcher at the top of the page |

#### Task model

| Challenge spec | Code | Type |
|---|---|---|
| `id` | `id` | `string` (UUID, required, generated by the server) |
| `titulo` | `title` | `string` (required, up to 100 characters) |
| `descricao` | `description` | `string` (optional, up to 500 characters) |
| `dataCriacao` | `createdAt` | ISO 8601 `string` (generated by the server) |

### Structure (MVC)

```
src/
├── app/                          # Next.js routes: thin, they only wire data to the Views
│   ├── api/trpc/[trpc]/route.ts  # Exposes tRPC over HTTP at /api/trpc/*
│   ├── page.tsx                  # Task list (SSR)
│   ├── tasks/new/page.tsx        # Create
│   ├── tasks/[id]/edit/page.tsx  # Edit (SSR loads the task by id; 404 if missing)
│   ├── error.tsx · not-found.tsx
│   └── layout.tsx                # Layout + providers (language and tRPC)
├── models/                       # M — data and rules
│   ├── task.schema.ts            # Task type + Zod schemas (shared by front and back)
│   └── task.model.ts             # In-memory "database" + operations
├── controllers/                  # C — API entry point
│   └── task.controller.ts        # tRPC router: list, getById, create, update, delete
├── views/                        # V — React components
│   ├── tasks/TaskList.tsx · TaskItem.tsx · TaskForm.tsx
│   ├── components/Feedback.tsx · LanguageSwitcher.tsx
│   └── utils/errors.ts
├── i18n/                         # Internationalization (pt-BR / en)
│   ├── config.ts                 # Supported languages, default language, cookie
│   ├── dictionaries/             # pt-BR.ts (defines the Dictionary type) and en.ts
│   ├── server.ts                 # getLocale() for Server Components
│   └── provider.tsx              # I18nProvider + useI18n() hook for Client Components
└── trpc/                         # tRPC infrastructure
    ├── init.ts                   # initTRPC + context (language) + error translation
    ├── router.ts                 # appRouter (combines the controllers) + AppRouter type
    ├── server.ts                 # getServerApi(): caller for Server Components (SSR without HTTP)
    ├── client.ts                 # tRPC hooks for Client Components
    └── provider.tsx              # tRPC + React Query provider
tests/unit/                       # Unit tests (Vitest)
```

**Request flow:** View (`trpc.task.delete.useMutation`) → HTTP `/api/trpc/task.delete` → Controller (validates input against the schema and handles errors) → Model (changes the data) → typed response back to the View.

### API (tRPC)

All procedures live at `/api/trpc/<procedure>`. Queries use `GET` and mutations use `POST`.

| Procedure | Type | Input | Errors |
|---|---|---|---|
| `task.list` | query | — | — |
| `task.getById` | query | `{ id }` | 400 (missing/invalid id), 404 |
| `task.create` | mutation | `{ title, description? }` | 400 (empty/missing title) |
| `task.update` | mutation | `{ id, title, description? }` | 400, 404 |
| `task.delete` | mutation | `{ id }` | 400, 404 |

```bash
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H "content-type: application/json" -H "cookie: locale=en" -d '{"title":""}'
# → 400 {"error":{"message":"Title is required", ... "code":"BAD_REQUEST"}}

# Without the cookie, messages default to Portuguese
curl -X POST http://localhost:3000/api/trpc/task.create \
  -H "content-type: application/json" -d '{"title":""}'
# → 400 {"error":{"message":"O título é obrigatório", ...}}
```

### Technical decisions

#### Architecture
- **Next.js 15, not 16:** the challenge asks for "(v15)" and also for "the latest versions". I used the latest 15.x release (15.5).
- **MVC inside Next.js:** `app/` only defines routes and wires data to the Views. Business rules live in `models/`, the API entry point in `controllers/` and the components in `views/`. Each tRPC router acts as a controller.
- **tRPC with the classic `@trpc/react-query` integration:** the hooks (`trpc.task.delete.useMutation()`) are direct and easy to read. Types flow from backend to frontend with no code generation, just `type AppRouter`.
- **English names:** the spec fields (`titulo`, `descricao`, `dataCriacao`) became `title`, `description` and `createdAt`, to match the rest of the code. The table above shows the mapping.

#### Task identity
- **Every operation uses only the `id`:** get, edit and delete receive only the `id`, both on the front (`key`, edit link, delete) and on the back (a `Map` keyed by `id`). Two tasks with the same title are never mixed up.
- **Required, server-generated `id`:** a UUID created with `crypto.randomUUID()` and validated with `z.uuid()`. The client never sends an `id` on create.
- **Immutable `id` and `createdAt`:** Zod drops any field that is not in the schema, so an update cannot change the `id` or the creation date.

#### Validation and errors
- **Shared Zod schema:** the same `taskInputSchema` validates the API and the form, so front and back rules never drift apart. The form does not even send the request when the data is invalid.
- **Errors as keys:** schemas and the controller use keys (`"titleRequired"`, `"taskNotFound"`) instead of fixed text. tRPC's `errorFormatter` translates them into the request's language instead of returning raw Zod JSON.
- **Proper HTTP status codes:** invalid input → 400 (`BAD_REQUEST`), missing task → 404 (`NOT_FOUND`). Network failures, when the request never reaches the server, become a friendly message on the front.

#### Data and rendering
- **Store on `globalThis`:** keeps data across hot reloads in development and makes the route handler and Server Components share the same instance.
- **SSR with a server caller:** pages call `(await getServerApi()).task.list()` directly on the server (`createCallerFactory`). They go through the same controller validation, with no HTTP request to the app's own API.
- **`force-dynamic` on the list page:** without it, Next pre-renders the page at build time and the list would be frozen.
- **Refreshing after mutations:** after a delete, `router.refresh()` re-runs SSR, so the server stays the single source of truth. If the task was already removed in another tab, the error shows up and the list is refreshed too. After creating or editing, the user goes back to the list with a success message (`?feedback=`), which is then removed from the URL.
- **No global `loading.tsx`:** with it, the page starts streaming before `notFound()` runs and the 404 is sent with HTTP status 200. Since the list arrives ready through SSR, loading states live in the buttons.
- **Dates without superjson:** `createdAt` is an ISO string, which travels through JSON without loss. Dates are displayed with a fixed time zone (`America/Sao_Paulo`) so the server and the browser format them the same way, avoiding hydration errors.

#### Internationalization
- **No extra library:** typed dictionaries in `src/i18n/dictionaries/`. `pt-BR.ts` defines the shape (`Dictionary`), and `en.ts` must follow it or TypeScript reports an error. Texts with variables are functions, e.g. `t.taskItem.deleted(title)`.
- **Language in the `locale` cookie:** the default is `pt-BR`. The PT/EN switcher writes the cookie and calls `router.refresh()`, and the page is rendered again on the server in the new language, including `<html lang>`, `<title>` and the date format. The API reads the same cookie to translate errors.
- **Usage:** Server Components use `getDictionary(await getLocale())` and Client Components use `const { t } = useI18n()`.
- **New language:** create the dictionary, register it in `dictionaries/index.ts` and add the code to `locales` (`config.ts`).

#### Tests
- **Unit tests only, with Vitest:** fast (under 1 s), with no server or browser to start.
- **API tested without a server:** the route handler's `GET`/`POST` functions receive a `Request` directly, so the tests cover the real HTTP path (status codes, messages and language from the cookie).
- **Isolation:** the in-memory store is cleared before each test.

| File | What it covers |
|---|---|
| `task.schema.test.ts` | Zod rules: required UUID `id`, required title, length limits, extra fields dropped |
| `task.model.test.ts` | In-memory store: unique ids, ordering, update/remove only affect the given `id` |
| `task.controller.test.ts` | Procedures via `createCaller`: CRUD by `id`, `BAD_REQUEST`, `NOT_FOUND`, immutable `id` and `createdAt` |
| `trpc-http.test.ts` | HTTP route handler: 200/400/404 status codes and messages translated by the language cookie |
| `i18n.test.ts` | Dictionaries share the same keys, `translateError`, language resolution from the cookie |

### Known limitations

- Data lives in memory: it is lost on restart and is not shared across instances (e.g. serverless). To persist it, only `task.model.ts` needs a new implementation; controllers and views stay the same.
- `npm audit` reports vulnerabilities in build-time dependencies: ESLint and the PostCSS bundled with Next 15. The PostCSS fix requires Next 16, and the challenge asks for v15.

### Next steps

- Optimistic delete and toasts.
- "Done" status, filters and pagination.
- React Query hydration (server prefetch) instead of `router.refresh()`.
- Real persistence (e.g. Prisma + SQLite).
