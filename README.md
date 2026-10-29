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

Abra http://localhost:8080 ou http://localhost:3000 no navegador para ver o resultado.
