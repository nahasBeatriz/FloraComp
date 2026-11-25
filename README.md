# FloraComp

Projeto de avaliação final desenvolvido para a disciplina de Programação de Aplicações Web.

## Proposta de Projeto

O projeto consiste no desenvolvimento de um site interativo voltado para o universo
da botânica, com foco na experiência do usuário na exploração e composição de arranjos
florais. A aplicação contará com um catálogo visual de flores equipado com busca e filtros
por luminosidade, frequência de rega e estação do ano ideal para cultivo, permitindo que o
usuário encontre rapidamente espécies adequadas ao seu contexto. Cada flor poderá ser
acessada individualmente para exibir uma ficha completa com nome, descrição botânica,
necessidade de luminosidade, frequência de irrigação e a estação em que se desenvolve
melhor. O site também permitirá que o usuário marque flores como favoritas, com as
preferências salvas localmente no navegador, e contará com alternância entre modo claro e
escuro para maior conforto visual. Além disso, uma seção de dicas sazonais orientará o
usuário sobre quais espécies estão em floração ou são mais indicadas para plantio na estação
atual, tornando a experiência mais contextualizada e útil.

O diferencial da aplicação está em sua ferramenta interativa de criação de arranjos
personalizados: o usuário poderá arrastar imagens das flores para uma área de composição e,
ao concluir sua seleção, receberá um feedback automático indicando se as flores escolhidas
são compatíveis entre si com base em seus requisitos similares de luz e água. Após a
finalização, o arranjo será salvo em uma galeria pessoal acompanhado de uma ficha de
cuidados consolidada, reunindo as instruções de rega, luminosidade e estação recomendada
para todas as flores presentes na composição. Os dados serão obtidos a partir da API pública
Perenual, complementados por um conjunto de dados local para garantir a completude das
informações exibidas na interface.

## Stack utilizada

| Camada | Tecnologia | Função |
|---|---|---|
| Runtime | Node.js | Base de execução do servidor |
| Framework | Next.js 16 (App Router) | Servidor HTTP, páginas e API routes |
| Frontend | React 19 + TypeScript | Interface e componentes |
| Estilização | Tailwind CSS v4 | Estilo e responsividade |
| Drag and drop | dnd-kit | Montagem interativa do arranjo (arrastar flores pro canvas) |
| ORM | Prisma 7 | Acesso ao banco de dados |
| Banco de dados | SQLite | Persistência de arranjos, favoritos e cache da Perenual |
| API externa | Perenual API | Dados botânicos das flores |

## Decisões Técnicas

Este projeto utiliza **Next.js 16** como framework principal, construído sobre **Node.js**.
Essa escolha substitui o uso de Express.js puro, pois o Next.js já incorpora internamente um
servidor HTTP completo, roteamento de páginas e roteamento de API.

As rotas de API em `src/app/api/` funcionam de forma equivalente às rotas `app.get()`/`app.post()`
do Express: recebem requisições HTTP, processam dados e retornam respostas JSON. A diferença
está na convenção — ao invés de registrar rotas manualmente, o Next.js as infere pela
estrutura de pastas.

A persistência é feita inteiramente via **Prisma** com **SQLite** (driver libSQL). As
páginas do frontend se comunicam exclusivamente pelas API routes, que por sua vez usam o
Prisma Client para ler e escrever no banco. O único dado mantido fora do banco é a
preferência de tema (claro/escuro), guardada em `localStorage` no navegador do usuário.

A API da Perenual tem cota diária limitada, então o catálogo e os detalhes de cada flor são
cacheados no próprio banco (`PerenualListCache` e `PerenualDetailsCache`). Isso evita
rebuscar a mesma página/flor repetidamente e serve de reserva: se a chamada ao vivo falhar
(cota esgotada ou API fora do ar), a aplicação cai para o cache local em vez de quebrar. A
sidebar de montagem de arranjo (`/arrangement`) lê exclusivamente desse cache, carregado uma
única vez, para não gastar cota a cada tecla digitada na busca.

## Pré-requisitos

- Node.js 18 ou superior
- npm, yarn, pnpm ou bun

## Configuração do ambiente

### 1. Crie o arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado **`.env.local`** com as seguintes variáveis:

```env
# Chave da API Perenual — obtenha gratuitamente em https://perenual.com/docs/api
PERENUAL_API_KEY=sua_chave_aqui

# URL do banco de dados SQLite local
DATABASE_URL=file:./dev.db
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Gere o Prisma Client e aplique o schema ao banco:

```bash
npx prisma generate
npx prisma db push
```

> `prisma db push` cria o arquivo `dev.db` com todas as tabelas definidas em `prisma/schema.prisma` (Flower, Arrangement, ArrangementFlower, Favorite, PerenualDetailsCache, PerenualListCache).
> Execute este comando sempre que o schema for alterado.

## Como executar

```bash
npm run dev # ou
yarn dev    # ou
pnpm dev    # ou
bun dev
```

Abra _http://localhost:3000_ no navegador para ver o resultado.

## Estrutura do banco de dados

O Prisma gerencia as seguintes entidades:

| Tabela | Função |
|---|---|
| `Flower` | Snapshot da flor no momento em que entra num arranjo |
| `Arrangement` | Arranjos salvos pelo usuário |
| `ArrangementFlower` | Relação N:N entre arranjo e flores (ordem salva em `positionX`) |
| `Favorite` | IDs Perenual das flores favoritadas |
| `PerenualDetailsCache` | Cache do detalhe de cada espécie (`GET /species/details/{id}`) |
| `PerenualListCache` | Cache da listagem/paginação do catálogo (`GET /species-list`), por página + filtros |

## Rotas de API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/flowers` | Lista flores da Perenual (com filtros e paginação) |
| GET | `/api/flowers/[id]` | Detalhe de uma flor pelo ID Perenual |
| GET | `/api/favorites` | Lista flores favoritadas |
| POST | `/api/favorites` | Adiciona um favorito `{ perenualId }` |
| DELETE | `/api/favorites` | Remove um favorito `{ perenualId }` |
| GET | `/api/arrangements` | Lista todos os arranjos salvos |
| POST | `/api/arrangements` | Cria um novo arranjo |
| GET | `/api/arrangements/[id]` | Detalhe de um arranjo |
| PUT | `/api/arrangements/[id]` | Atualiza nome e flores de um arranjo existente |
| DELETE | `/api/arrangements/[id]` | Remove um arranjo |
| GET | `/api/flowers/cached` | Lista flores já cacheadas em `PerenualDetailsCache` (usado pela sidebar de montagem de arranjo) |
| GET | `/api/flowers/care?ids=1,2,3` | Dados de luz/rega/estação de vários IDs em uma única chamada (evita N chamadas por página do catálogo) |
| POST | `/api/flowers/enrich` | Rota de manutenção: busca e cacheia detalhes de espécies ainda não cacheadas (não é usada pela UI) |
