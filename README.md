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

## Decisões Técnicas

Este projeto utiliza **Next.js 15** como framework principal, construído sobre **Node.js**.
Essa escolha substitui o uso de Express.js puro, pois o Next.js já incorpora internamente um
servidor HTTP completo, roteamento de páginas e roteamento de API — tudo o que o Express
ofereceria, porém com menos configuração manual e maior integração com o frontend React.

As rotas de API em `src/app/api/` funcionam de forma equivalente às rotas `app.get()`/`app.post()`
do Express: recebem requisições HTTP, processam dados e retornam respostas JSON. A diferença
está na convenção — ao invés de registrar rotas manualmente, o Next.js as infere pela
estrutura de pastas.

### Stack utilizada

| Camada | Tecnologia | Função |
|---|---|---|
| Runtime | Node.js | Base de execução do servidor |
| Framework | Next.js 15 (App Router) | Servidor HTTP, páginas e API routes |
| Frontend | React 19 + TypeScript | Interface e componentes |
| Estilização | Tailwind CSS v4 | Estilo e responsividade |
| ORM | Prisma | Acesso ao banco de dados |
| Banco de dados | SQLite (`dev.db`) | Persistência local de arranjos e favoritos |
| API externa | Perenual API | Dados botânicos das flores |
| Persistência no cliente | `localStorage` | Favoritos e galeria no navegador |

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
PERENUAL_API_KEY=sua_chave_aqui
```

A chave pode ser obtida gratuitamente em _https://perenual.com/docs/api_.

## Como Executar o Projeto

Abra um terminal dentro da pasta do projeto e execute de acordo com o que está instalado na sua máquina:

```bash
npm run dev
```
```bash
yarn dev
```
```bash
pnpm dev
```
```bash
bun dev
```

Abra _http://localhost:3000_ no navegador para ver o resultado.
