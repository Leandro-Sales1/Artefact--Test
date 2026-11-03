# Gerenciador de Tarefas · Task Manager — Next.js 15 + tRPC

🇧🇷 [Português](#-português) · 🇺🇸 [English](#-english)

---

## 🇧🇷 Português

Aplicação de gerenciamento de tarefas (CRUD) feita como desafio técnico.
É um monolito Next.js: o mesmo projeto contém o backend (tRPC, com as tarefas guardadas **em memória**) e o frontend (React com SSR), com interface em português e inglês.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · tRPC v11 · TanStack React Query v5 · Zod v4 · Tailwind CSS v4 · Vitest

### Como rodar

Requisitos: Node.js 22+ (testado no 24, versão em `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:3000
```

Produção:

```bash
npm run build
npm start
```

| Script                  | O que faz                                                            |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento                                          |
| `npm run build`         | Build de produção                                                    |
| `npm start`             | Sobe o build de produção                                             |
| `npm run lint`          | ESLint                                                               |
| `npm run typecheck`     | Checagem de tipos do TypeScript                                      |
| `npm run format`        | Formata o código com Prettier (indentação de 2 espaços)              |
| `npm run format:check`  | Confere se o código está formatado, sem alterar nada                 |
| `npm test`              | Roda os testes                                                       |
| `npm run test:watch`    | Testes em modo watch                                                 |
| `npm run test:coverage` | Testes com relatório de cobertura (terminal e `coverage/index.html`) |
| `npm run check`         | Roda lint, tipos, formatação e testes, na mesma ordem da CI          |

> As tarefas ficam em memória: elas se perdem ao reiniciar o servidor.

### Como testar

1. Crie 6 ou mais tarefas: a lista mostra 5 e carrega as próximas ao rolar.
2. Tente salvar sem título: o erro aparece no campo, sem chamar a API.
3. Marque uma tarefa como concluída: o fundo fica verde e o Editar some.
4. Exclua uma tarefa: um toast confirma e some após 5 segundos.
5. Alterne entre PT e EN: a interface e as mensagens da API mudam de idioma.

### Funcionalidades

| Requisito                                                              | Onde está                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Criar, listar, atualizar e excluir tarefas via tRPC                    | `src/controllers/task.controller.ts`                                                                    |
| Não criar tarefa sem título                                            | Schema Zod em `src/models/task.schema.ts`, validado no backend **e** no formulário                      |
| Erros significativos (ex.: atualizar tarefa inexistente → `NOT_FOUND`) | Controller + `errorFormatter` em `src/trpc/init.ts`                                                     |
| Listagem com SSR                                                       | `src/app/page.tsx` (a primeira página vem pronta do servidor)                                           |
| Scroll infinito: 5 tarefas por vez, carregadas conforme o usuário rola | `src/views/tasks/TaskList.tsx` + `task.list` paginado por cursor                                        |
| Excluir direto na lista, com feedback de sucesso/erro                  | `src/views/tasks/TaskItem.tsx`                                                                          |
| Marcar tarefa como concluída (tarefa concluída não pode ser editada)   | Toggle em `TaskItem.tsx` + `task.setCompleted`                                                          |
| Formulário de criação/edição com hooks e validação                     | `src/views/tasks/TaskForm.tsx`                                                                          |
| Estados de carregamento, sucesso e falha                               | Botões "Salvando..."/"Excluindo...", toasts, "Carregando mais tarefas...", `error.tsx`, `not-found.tsx` |
| Interface e mensagens da API em português e inglês                     | `src/i18n/` + seletor PT/EN no topo da página                                                           |

#### Modelo da tarefa

| Enunciado     | Código        | Tipo                                               |
| ------------- | ------------- | -------------------------------------------------- |
| `id`          | `id`          | `string` (UUID, obrigatório, gerado pelo servidor) |
| `titulo`      | `title`       | `string` (obrigatório, até 100 caracteres)         |
| `descricao`   | `description` | `string` (opcional, até 500 caracteres)            |
| `dataCriacao` | `createdAt`   | `string` ISO 8601 (gerado pelo servidor)           |
| —             | `completed`   | `boolean` (começa como `false`)                    |

### Estrutura (MVC)

```
src/
├── app/                          # Rotas do Next.js: finas, só ligam os dados às Views
│   ├── api/trpc/[trpc]/route.ts  # Expõe o tRPC via HTTP em /api/trpc/*
│   ├── page.tsx                  # Listagem (SSR da primeira página)
│   ├── tasks/new/page.tsx        # Criação
│   ├── tasks/[id]/edit/page.tsx  # Edição (SSR busca a tarefa pelo id; 404 se não existir; aviso se concluída)
│   ├── error.tsx · not-found.tsx
│   ├── globals.css               # Tema do Tailwind: cores e fontes
│   └── layout.tsx                # Layout + providers (idioma, tRPC e toasts)
├── models/                       # M — dados e regras
│   ├── task.schema.ts            # Tipo Task + schemas Zod (usados no front e no back)
│   └── task.model.ts             # "Banco" em memória + operações
├── controllers/                  # C — entrada da API
│   └── task.controller.ts        # Router tRPC: list, getById, create, update, setCompleted, delete
├── views/                        # V — componentes React
│   ├── tasks/TaskList.tsx · TaskItem.tsx · TaskForm.tsx
│   ├── components/Toast.tsx · LanguageSwitcher.tsx
│   └── utils/errors.ts
├── i18n/                         # Internacionalização (pt-BR / en)
│   ├── config.ts                 # Idiomas suportados, idioma padrão, cookie
│   ├── dictionaries/             # pt-BR.ts (define o tipo Dictionary) e en.ts
│   ├── server.ts                 # getLocale() para Server Components
│   └── provider.tsx              # I18nProvider + hook useI18n() para Client Components
└── trpc/                         # Infraestrutura do tRPC
    ├── init.ts                   # initTRPC + contexto (idioma) + tradução dos erros
    ├── router.ts                 # appRouter (junta os controllers) + tipo AppRouter
    ├── server.ts                 # getServerApi(): tRPC no servidor, sem HTTP
    ├── client.ts                 # Hooks do tRPC para Client Components
    └── provider.tsx              # Provider do tRPC + React Query
tests/
├── unit/                         # Testes unitários (Vitest): back em Node, componentes em jsdom
└── helpers/                      # Store limpo e render dos componentes com a API real
.github/workflows/ci.yml          # CI: lint, tipos, formatação, testes com cobertura e build
```

**Fluxo de uma requisição:** View (`trpc.task.delete.useMutation`) → HTTP `/api/trpc/task.delete` → Controller (valida a entrada com o schema e trata erros) → Model (altera os dados) → resposta tipada de volta para a View.

### API (tRPC)

Todas as procedures ficam em `/api/trpc/<procedure>`. Queries usam `GET` e mutations usam `POST`.

| Procedure           | Tipo     | Entrada                                                                       | Erros                                       |
| ------------------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| `task.list`         | query    | `{ limit?, cursor? }` → `{ items, nextCursor, total }`                        | 400 (`limit` fora de 1–50, cursor inválido) |
| `task.getById`      | query    | `{ id }`                                                                      | 400 (id ausente/inválido), 404              |
| `task.create`       | mutation | `{ title, description? }`                                                     | 400 (título vazio/ausente)                  |
| `task.update`       | mutation | `{ id, title, description? }` (sem `description` mantém a atual; `""` remove) | 400, 404, 412 (tarefa concluída)            |
| `task.setCompleted` | mutation | `{ id, completed }`                                                           | 400, 404                                    |
| `task.delete`       | mutation | `{ id }`                                                                      | 400, 404                                    |

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
- **Códigos HTTP corretos:** entrada inválida → 400 (`BAD_REQUEST`), tarefa inexistente → 404 (`NOT_FOUND`), editar tarefa concluída → 412 (`PRECONDITION_FAILED`). Falhas de rede, quando a requisição nem chega ao servidor, viram uma mensagem amigável no front.
- **Erros inesperados não vazam detalhes:** um erro 500 devolve uma mensagem genérica traduzida, sem a mensagem interna nem o stack trace. Os detalhes ficam só no log do servidor (`onError` da rota).
- **Mesma regra no front e no back:** a tarefa concluída esconde o botão Editar, mas o servidor também recusa a edição, e a página de edição mostra um aviso no lugar do formulário. Se a tarefa for excluída ou concluída em outra aba durante a edição, o formulário mostra o erro e volta para a lista.
- **Toasts para resultados de ações:** sucesso em verde e erro em vermelho, no topo da tela, somem após 5 segundos. Ficam no layout, então continuam visíveis ao trocar de página. Erros de validação continuam embaixo de cada campo.

#### Dados e renderização

- **Store em `globalThis`:** mantém os dados entre hot-reloads no desenvolvimento e garante que o route handler e os Server Components usem a mesma instância.
- **tRPC no servidor sem HTTP:** a listagem e a página de edição chamam `(await getServerApi()).task.list()` / `.getById()` direto no servidor (`createCallerFactory`). Elas passam pelas mesmas validações do controller, sem uma requisição HTTP para a própria API.
- **Scroll infinito com SSR na primeira página:** o servidor busca as primeiras 5 tarefas e as passa para o `TaskList`, que as usa como `initialData` do `useInfiniteQuery`. No navegador, a lista continua a partir daí. Como `initialData` só vale quando a lista ainda não está no cache, trocar de idioma renderiza a página de novo sem perder as páginas já carregadas. Um elemento no fim da lista, observado com `IntersectionObserver`, pede a próxima página quando chega perto da área visível. O tamanho da página é a constante `TASK_PAGE_SIZE`, usada no servidor e no navegador.
- **Paginação por cursor, não por offset:** o cursor é a última tarefa recebida (`createdAt` + `id`), e a próxima página começa logo depois dela na ordenação. Com offset, criar ou excluir uma tarefa enquanto o usuário rola faria tarefas se repetirem ou sumirem. O `id` desempata tarefas criadas no mesmo instante.
- **`force-dynamic` na listagem:** sem isso, o Next pré-renderiza a página no build e a lista ficaria congelada.
- **Atualização depois das mutações:** excluir ou concluir chama `utils.task.list.invalidate()`, que busca de novo as páginas já carregadas, e o servidor continua sendo a única fonte de verdade. O botão fica desabilitado até a lista ser atualizada. Se a tarefa já tinha sido removida em outra aba, o erro aparece e a lista também é atualizada. Criar ou editar descarta a lista em cache e volta para ela, que recomeça com a primeira página renderizada no servidor.
- **Sem atualização otimista:** a interface só muda depois que o servidor confirma. É menos instantâneo, mas o código fica mais simples de seguir e nunca mostra um estado que o servidor recusou.
- **Sem `loading.tsx` global:** com ele, a página começa a ser transmitida antes do `notFound()` e o 404 sai com status HTTP 200. Como a primeira página já chega pronta via SSR, os estados de carregamento ficam nos botões e no fim da lista.
- **Datas sem superjson:** `createdAt` é uma string ISO, que trafega em JSON sem perda. A exibição usa um fuso fixo (`America/Sao_Paulo`) para o servidor e o navegador formatarem igual, sem erro de hidratação.

#### Visual

- **Tailwind com tema próprio:** cores (`paper`, `ink`, `muted`, `accent`, `danger`...) e fontes ficam definidas uma vez em `globals.css`, com `@theme`. Os componentes usam só classes do Tailwind, como `bg-accent` e `text-muted`.
- **Fontes via `next/font`:** Newsreader nos títulos e Public Sans no texto, servidas pelo próprio app, sem requisição ao Google no navegador.
- **Acessibilidade:** o toggle de conclusão é um `button` com `role="switch"` e `aria-checked`. Editar, Excluir e o toggle apontam para o título da tarefa com `aria-describedby`, então o leitor de tela diz de qual tarefa se trata. Os toasts usam `role="status"` (sucesso) e `role="alert"` (erro). Os botões de idioma têm área de toque de 44px.

#### Internacionalização

- **Sem biblioteca extra:** dicionários tipados em `src/i18n/dictionaries/`. O `pt-BR.ts` define o formato (`Dictionary`), e o `en.ts` precisa seguir o mesmo formato, senão o TypeScript acusa erro. Textos com variáveis são funções, ex.: `t.taskItem.deleted(title)`.
- **Idioma no cookie `locale`:** o padrão é `pt-BR`. O seletor PT/EN grava o cookie e chama `router.refresh()`, e a página é renderizada de novo no servidor já no novo idioma, inclusive `<html lang>`, `<title>` e o formato da data. A API lê o mesmo cookie para traduzir os erros.
- **Uso:** Server Components usam `getDictionary(await getLocale())` e Client Components usam `const { t } = useI18n()`.
- **Novo idioma:** crie o dicionário, registre-o em `dictionaries/index.ts` e acrescente o código em `locales` (`config.ts`).

#### Testes

- **Só testes unitários, com Vitest:** rápidos (poucos segundos) e sem precisar subir servidor nem navegador. O backend roda em ambiente Node e os componentes em jsdom, com Testing Library.
- **Componentes testados com a API real:** o helper `renderWithProviders` liga o cliente tRPC direto no route handler, sem servidor. Assim o teste do formulário cria a tarefa de verdade no store, e não depende de mocks da API. Só o roteador do Next é simulado. Para os erros de rede, o helper tem um modo offline.
- **API testada sem servidor:** os handlers `GET`/`POST` do route handler recebem um `Request` direto, então os testes cobrem o caminho HTTP real (status, mensagens e idioma pelo cookie).
- **Isolamento:** o store em memória é limpo antes de cada teste.

| Arquivo                     | O que cobre                                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `task.schema.test.ts`       | Regras do Zod: `id` obrigatório e UUID, título obrigatório, limites de tamanho, campos extras descartados                                                                                              |
| `task.model.test.ts`        | Store em memória: ids únicos, ordenação, paginação por cursor sem repetir nem pular tarefas (mesmo após exclusões), conclusão, update/remove afetam só o `id` informado                                |
| `task.controller.test.ts`   | Procedures via `createCaller`: CRUD por `id`, páginas de `TASK_PAGE_SIZE`, `limit` inválido, concluir/reabrir, tarefa concluída não editável, `BAD_REQUEST`, `NOT_FOUND`, `id` e `createdAt` imutáveis |
| `trpc-http.test.ts`         | Route handler HTTP: status 200/400/404/412 e mensagens traduzidas pelo cookie de idioma, inclusive cursor inválido                                                                                     |
| `trpc-errors.test.ts`       | Erro inesperado → 500 com mensagem genérica, sem detalhes internos nem stack trace                                                                                                                     |
| `i18n.test.ts`              | Dicionários com as mesmas chaves, textos com variáveis, plural da contagem, `translateError`, resolução do idioma pelo cookie                                                                          |
| `Toast.test.tsx`            | Mais recente primeiro, some após 5 s, fechar pelo botão                                                                                                                                                |
| `TaskForm.test.tsx`         | Validação no navegador, criar e editar, tarefa concluída durante a edição, erro de rede                                                                                                                |
| `TaskItem.test.tsx`         | Concluir/reabrir, tarefa concluída sem Editar, excluir com e sem confirmação, tarefa já excluída, `aria-describedby`                                                                                   |
| `TaskList.test.tsx`         | Estado vazio, primeira página do servidor, scroll infinito até o fim, erro ao carregar mais e "Tentar novamente"                                                                                       |
| `LanguageSwitcher.test.tsx` | Idioma atual marcado, troca grava o cookie e renderiza de novo                                                                                                                                         |
| `pages.test.tsx`            | Lista renderiza só a primeira página, edição carrega a tarefa, aviso de tarefa concluída, 404, páginas de erro                                                                                         |

Cobertura atual (`npm run test:coverage`): cerca de 95% das linhas. O que fica de fora é o que só existe no Next de verdade: `layout.tsx` (fontes do `next/font`), o provider do tRPC do navegador e a página `tasks/new`, que só renderiza o formulário.

#### Qualidade de código

- **Prettier:** indentação de 2 espaços, linhas de até 100 caracteres. `npm run format` formata e `npm run format:check` só confere.
- **`.editorconfig` e `.gitattributes`:** o editor usa 2 espaços e quebras de linha LF, e o Git guarda tudo em LF, inclusive no Windows.
- **CI no GitHub Actions:** a cada push na `main` e em todo PR, roda lint, checagem de tipos, formatação, testes com cobertura e o build de produção.

### Limitações conhecidas

- Os dados ficam em memória: somem ao reiniciar e não são compartilhados entre várias instâncias (ex.: serverless). Para persistir, basta trocar a implementação de `task.model.ts`, sem mexer em controller ou views.
- O `npm audit` aponta vulnerabilidades em dependências de build: ESLint e o PostCSS que vem dentro do Next 15. A correção do PostCSS exige o Next 16, e o desafio pede a v15.

---

## 🇺🇸 English

Task management application (CRUD) built as a technical challenge.
It is a Next.js monolith: the same project holds the backend (tRPC, with tasks stored **in memory**) and the frontend (React with SSR), with the UI available in Portuguese and English.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · tRPC v11 · TanStack React Query v5 · Zod v4 · Tailwind CSS v4 · Vitest

### Getting started

Requirements: Node.js 22+ (tested on 24, version in `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

| Script                  | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Development server                                                |
| `npm run build`         | Production build                                                  |
| `npm start`             | Starts the production build                                       |
| `npm run lint`          | ESLint                                                            |
| `npm run typecheck`     | TypeScript type checking                                          |
| `npm run format`        | Formats the code with Prettier (2-space indentation)              |
| `npm run format:check`  | Checks that the code is formatted, without changing anything      |
| `npm test`              | Runs the tests                                                    |
| `npm run test:watch`    | Tests in watch mode                                               |
| `npm run test:coverage` | Tests with a coverage report (terminal and `coverage/index.html`) |
| `npm run check`         | Runs lint, types, formatting and tests, in the same order as CI   |

> Tasks live in memory: they are lost when the server restarts.

### How to try it

1. Create 6 or more tasks: the list shows 5 and loads more as you scroll.
2. Try to save without a title: the error shows on the field, without calling the API.
3. Mark a task as completed: the background turns green and Edit disappears.
4. Delete a task: a toast confirms it and disappears after 5 seconds.
5. Switch between PT and EN (the default is PT): the UI and the API messages change language.

### Features

| Requirement                                                    | Where                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Create, list, update and delete tasks through tRPC             | `src/controllers/task.controller.ts`                                                             |
| No task without a title                                        | Zod schema in `src/models/task.schema.ts`, validated on the backend **and** in the form          |
| Meaningful errors (e.g. updating a missing task → `NOT_FOUND`) | Controller + `errorFormatter` in `src/trpc/init.ts`                                              |
| Server-side rendered list                                      | `src/app/page.tsx` (the first page arrives ready from the server)                                |
| Infinite scroll: 5 tasks at a time, loaded as the user scrolls | `src/views/tasks/TaskList.tsx` + cursor-paginated `task.list`                                    |
| Delete from the list, with success/error feedback              | `src/views/tasks/TaskItem.tsx`                                                                   |
| Mark a task as completed (completed tasks cannot be edited)    | Switch in `TaskItem.tsx` + `task.setCompleted`                                                   |
| Create/edit form with hooks and validation                     | `src/views/tasks/TaskForm.tsx`                                                                   |
| Loading, success and failure states                            | "Saving..."/"Deleting..." buttons, toasts, "Loading more tasks...", `error.tsx`, `not-found.tsx` |
| UI and API messages in Portuguese and English                  | `src/i18n/` + PT/EN switcher at the top of the page                                              |

#### Task model

| Challenge spec | Code          | Type                                               |
| -------------- | ------------- | -------------------------------------------------- |
| `id`           | `id`          | `string` (UUID, required, generated by the server) |
| `titulo`       | `title`       | `string` (required, up to 100 characters)          |
| `descricao`    | `description` | `string` (optional, up to 500 characters)          |
| `dataCriacao`  | `createdAt`   | ISO 8601 `string` (generated by the server)        |
| —              | `completed`   | `boolean` (starts as `false`)                      |

### Structure (MVC)

```
src/
├── app/                          # Next.js routes: thin, they only wire data to the Views
│   ├── api/trpc/[trpc]/route.ts  # Exposes tRPC over HTTP at /api/trpc/*
│   ├── page.tsx                  # Task list (SSR of the first page)
│   ├── tasks/new/page.tsx        # Create
│   ├── tasks/[id]/edit/page.tsx  # Edit (SSR loads the task by id; 404 if missing; notice if completed)
│   ├── error.tsx · not-found.tsx
│   ├── globals.css               # Tailwind theme: colors and fonts
│   └── layout.tsx                # Layout + providers (language, tRPC and toasts)
├── models/                       # M — data and rules
│   ├── task.schema.ts            # Task type + Zod schemas (shared by front and back)
│   └── task.model.ts             # In-memory "database" + operations
├── controllers/                  # C — API entry point
│   └── task.controller.ts        # tRPC router: list, getById, create, update, setCompleted, delete
├── views/                        # V — React components
│   ├── tasks/TaskList.tsx · TaskItem.tsx · TaskForm.tsx
│   ├── components/Toast.tsx · LanguageSwitcher.tsx
│   └── utils/errors.ts
├── i18n/                         # Internationalization (pt-BR / en)
│   ├── config.ts                 # Supported languages, default language, cookie
│   ├── dictionaries/             # pt-BR.ts (defines the Dictionary type) and en.ts
│   ├── server.ts                 # getLocale() for Server Components
│   └── provider.tsx              # I18nProvider + useI18n() hook for Client Components
└── trpc/                         # tRPC infrastructure
    ├── init.ts                   # initTRPC + context (language) + error translation
    ├── router.ts                 # appRouter (combines the controllers) + AppRouter type
    ├── server.ts                 # getServerApi(): tRPC on the server, no HTTP
    ├── client.ts                 # tRPC hooks for Client Components
    └── provider.tsx              # tRPC + React Query provider
tests/
├── unit/                         # Unit tests (Vitest): backend in Node, components in jsdom
└── helpers/                      # Store reset and component rendering with the real API
.github/workflows/ci.yml          # CI: lint, types, formatting, tests with coverage and build
```

**Request flow:** View (`trpc.task.delete.useMutation`) → HTTP `/api/trpc/task.delete` → Controller (validates input against the schema and handles errors) → Model (changes the data) → typed response back to the View.

### API (tRPC)

All procedures live at `/api/trpc/<procedure>`. Queries use `GET` and mutations use `POST`.

| Procedure           | Type     | Input                                                                                   | Errors                                     |
| ------------------- | -------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `task.list`         | query    | `{ limit?, cursor? }` → `{ items, nextCursor, total }`                                  | 400 (`limit` outside 1–50, invalid cursor) |
| `task.getById`      | query    | `{ id }`                                                                                | 400 (missing/invalid id), 404              |
| `task.create`       | mutation | `{ title, description? }`                                                               | 400 (empty/missing title)                  |
| `task.update`       | mutation | `{ id, title, description? }` (no `description` keeps the current one; `""` removes it) | 400, 404, 412 (completed task)             |
| `task.setCompleted` | mutation | `{ id, completed }`                                                                     | 400, 404                                   |
| `task.delete`       | mutation | `{ id }`                                                                                | 400, 404                                   |

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
- **Proper HTTP status codes:** invalid input → 400 (`BAD_REQUEST`), missing task → 404 (`NOT_FOUND`), editing a completed task → 412 (`PRECONDITION_FAILED`). Network failures, when the request never reaches the server, become a friendly message on the front.
- **Unexpected errors leak no details:** a 500 error returns a generic translated message, without the internal message or the stack trace. The details stay in the server log only (the route's `onError`).
- **Same rule on front and back:** a completed task hides the Edit link, but the server also rejects the edit, and the edit page shows a notice instead of the form. If the task is deleted or completed in another tab while being edited, the form shows the error and goes back to the list.
- **Toasts for action results:** green for success and red for errors, at the top of the screen, gone after 5 seconds. They live in the layout, so they stay visible across page changes. Validation errors still show under each field.

#### Data and rendering

- **Store on `globalThis`:** keeps data across hot reloads in development and makes the route handler and Server Components share the same instance.
- **tRPC on the server without HTTP:** the list and edit pages call `(await getServerApi()).task.list()` / `.getById()` directly on the server (`createCallerFactory`). They go through the same controller validation, with no HTTP request to the app's own API.
- **Infinite scroll with SSR for the first page:** the server fetches the first 5 tasks and passes them to `TaskList`, which uses them as the `initialData` of `useInfiniteQuery`. In the browser, the list continues from there. Since `initialData` only applies when the list is not cached yet, switching languages renders the page again without losing the pages already loaded. An element at the end of the list, watched with `IntersectionObserver`, requests the next page when it gets close to the viewport. The page size is the `TASK_PAGE_SIZE` constant, shared by server and browser.
- **Cursor pagination, not offset:** the cursor is the last task received (`createdAt` + `id`), and the next page starts right after it in the sort order. With offsets, creating or deleting a task while the user scrolls would make tasks repeat or disappear. The `id` breaks ties between tasks created at the same instant.
- **`force-dynamic` on the list page:** without it, Next pre-renders the page at build time and the list would be frozen.
- **Refreshing after mutations:** deleting or completing calls `utils.task.list.invalidate()`, which refetches the pages already loaded, so the server stays the single source of truth. The button stays disabled until the list is refreshed. If the task was already removed in another tab, the error shows up and the list is refreshed too. Creating or editing drops the cached list and goes back to it, starting over from the first page rendered on the server.
- **No optimistic updates:** the UI only changes after the server confirms. It is less instant, but the code is easier to follow and never shows a state the server rejected.
- **No global `loading.tsx`:** with it, the page starts streaming before `notFound()` runs and the 404 is sent with HTTP status 200. Since the first page arrives ready through SSR, loading states live in the buttons and at the end of the list.
- **Dates without superjson:** `createdAt` is an ISO string, which travels through JSON without loss. Dates are displayed with a fixed time zone (`America/Sao_Paulo`) so the server and the browser format them the same way, avoiding hydration errors.

#### Visual design

- **Tailwind with its own theme:** colors (`paper`, `ink`, `muted`, `accent`, `danger`...) and fonts are defined once in `globals.css`, with `@theme`. Components only use Tailwind classes, such as `bg-accent` and `text-muted`.
- **Fonts through `next/font`:** Newsreader for headings and Public Sans for text, served by the app itself, with no request to Google from the browser.
- **Accessibility:** the completion switch is a `button` with `role="switch"` and `aria-checked`. Edit, Delete and the switch point to the task title with `aria-describedby`, so screen readers say which task they belong to. Toasts use `role="status"` (success) and `role="alert"` (error). The language buttons have 44px touch targets.

#### Internationalization

- **No extra library:** typed dictionaries in `src/i18n/dictionaries/`. `pt-BR.ts` defines the shape (`Dictionary`), and `en.ts` must follow it or TypeScript reports an error. Texts with variables are functions, e.g. `t.taskItem.deleted(title)`.
- **Language in the `locale` cookie:** the default is `pt-BR`. The PT/EN switcher writes the cookie and calls `router.refresh()`, and the page is rendered again on the server in the new language, including `<html lang>`, `<title>` and the date format. The API reads the same cookie to translate errors.
- **Usage:** Server Components use `getDictionary(await getLocale())` and Client Components use `const { t } = useI18n()`.
- **New language:** create the dictionary, register it in `dictionaries/index.ts` and add the code to `locales` (`config.ts`).

#### Tests

- **Unit tests only, with Vitest:** fast (a few seconds), with no server or browser to start. The backend runs in a Node environment and the components in jsdom, with Testing Library.
- **Components tested against the real API:** the `renderWithProviders` helper wires the tRPC client straight to the route handler, with no server. So the form test really creates the task in the store and does not depend on API mocks. Only the Next router is mocked. For network errors, the helper has an offline mode.
- **API tested without a server:** the route handler's `GET`/`POST` functions receive a `Request` directly, so the tests cover the real HTTP path (status codes, messages and language from the cookie).
- **Isolation:** the in-memory store is cleared before each test.

| File                        | What it covers                                                                                                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task.schema.test.ts`       | Zod rules: required UUID `id`, required title, length limits, extra fields dropped                                                                                                             |
| `task.model.test.ts`        | In-memory store: unique ids, ordering, cursor pagination with no repeated or skipped tasks (even after deletes), completion, update/remove only affect the given `id`                          |
| `task.controller.test.ts`   | Procedures via `createCaller`: CRUD by `id`, `TASK_PAGE_SIZE` pages, invalid `limit`, complete/reopen, completed task not editable, `BAD_REQUEST`, `NOT_FOUND`, immutable `id` and `createdAt` |
| `trpc-http.test.ts`         | HTTP route handler: 200/400/404/412 status codes and messages translated by the language cookie, including an invalid cursor                                                                   |
| `trpc-errors.test.ts`       | Unexpected error → 500 with a generic message, no internal details or stack trace                                                                                                              |
| `i18n.test.ts`              | Dictionaries share the same keys, texts with variables, count pluralization, `translateError`, language resolution from the cookie                                                             |
| `Toast.test.tsx`            | Newest first, gone after 5 s, close button                                                                                                                                                     |
| `TaskForm.test.tsx`         | Browser-side validation, create and edit, task completed while editing, network error                                                                                                          |
| `TaskItem.test.tsx`         | Complete/reopen, completed task without Edit, delete with and without confirmation, already deleted task, `aria-describedby`                                                                   |
| `TaskList.test.tsx`         | Empty state, first page from the server, infinite scroll to the end, error loading more and "Try again"                                                                                        |
| `LanguageSwitcher.test.tsx` | Current language marked, switching writes the cookie and renders again                                                                                                                         |
| `pages.test.tsx`            | List renders only the first page, edit loads the task, completed task notice, 404, error pages                                                                                                 |

Current coverage (`npm run test:coverage`): about 95% of lines. What stays out is what only exists in a real Next app: `layout.tsx` (`next/font` fonts), the browser tRPC provider and the `tasks/new` page, which only renders the form.

#### Code quality

- **Prettier:** 2-space indentation, lines up to 100 characters. `npm run format` formats and `npm run format:check` only checks.
- **`.editorconfig` and `.gitattributes`:** the editor uses 2 spaces and LF line endings, and Git stores everything as LF, Windows included.
- **CI on GitHub Actions:** on every push to `main` and on every PR, it runs lint, type checking, formatting, tests with coverage and the production build.

### Known limitations

- Data lives in memory: it is lost on restart and is not shared across instances (e.g. serverless). To persist it, only `task.model.ts` needs a new implementation; controllers and views stay the same.
- `npm audit` reports vulnerabilities in build-time dependencies: ESLint and the PostCSS bundled with Next 15. The PostCSS fix requires Next 16, and the challenge asks for v15.
