<div align="center">
  <img alt="Search Mini" src="./public/favicon.svg" width="180" />

  <br />

# Search Mini

**Um espaço de busca minimalista para web, música e seus favoritos.**

</div>

## Sobre

O Search Mini reúne diferentes formas de pesquisar e organizar conteúdo em uma interface compacta. Escolha um mecanismo de busca, monte uma playlist ou guarde atalhos no Workspace — com preferências e dados salvos localmente no navegador.

## Recursos

- **Busca na Web:** Google, DuckDuckGo, Brave e Bing em um único seletor.
- **Música:** crie uma playlist a partir de URLs do YouTube. Reordene faixas, controle a reprodução, use repetição e modo aleatório, e organize a lista sem duplicatas.
- **Workspace:** salve atalhos para seus sites. Digite `add: Nome do favorito` para criar um cartão; consultas comuns podem ser encaminhadas ao mecanismo de busca padrão.
- **Notas:** crie notas em texto puro, reorganize os cartões arrastando e escolha a altura dos campos entre 5, 8 ou 12 linhas. A pesquisa filtra títulos ou encaminha a consulta ao buscador web selecionado. No celular, os cartões rolam em uma área própria para manter a busca visível. Digitar `- ` no início de uma linha cria um marcador circular de tarefa; há um limite de duas notas vazias.
- **Temas:** Sistema, Claro, Escuro, Preto e Pastel, com transição suave ao trocar a aparência.
- **Personalização:** modo monocromático e opções de configuração para o Workspace.
- **Importação e exportação:** faça backup de configurações, cartões, playlist e outros dados do aplicativo em JSON.
- **Interface adaptável:** menus e submenus se ajustam a telas menores; em dispositivos touch, submenus podem ser abertos com um toque.

## Como usar

1. Use o seletor à esquerda da barra de pesquisa para escolher uma sessão ou mecanismo de busca.
2. No computador, passe o cursor sobre **Web**, **Tema** ou **Data** para abrir as opções. Em dispositivos touch, toque para expandir.
3. Na sessão **Música**, cole uma URL de vídeo do YouTube na barra de pesquisa para adicionar uma faixa à playlist.
4. Na sessão **Workspace**, digite `add: Nome do favorito` para criar um cartão.
5. Na sessão **Notas**, use o botão `+` para criar notas, edite o título e o texto diretamente nos cartões e arraste-os pelo ícone de alça para reorganizar. O botão de configurações permite alterar a busca e o tamanho dos cards.
6. Abra **Data** no menu para exportar ou importar um backup.
7. Acesse os créditos no final do menu para encontrar o desenvolvedor nas redes sociais.

## Executar localmente

**Requisitos:** Node.js 16 ou superior e npm.

```bash
npm install
npm run dev
```

O servidor de desenvolvimento é iniciado na porta `3000`.

Comandos adicionais:

```bash
npm run lint   # Verificação de tipos TypeScript
npm run build  # Build de produção
npm run preview
```

## Tecnologias

- React e TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- LocalStorage para persistência local

## Desenvolvedor

**Gui23x**

- [GitHub](https://github.com/gui23x)
- [Instagram](https://www.instagram.com/dsngui)
- [LinkedIn](https://www.linkedin.com/in/guilherme-gomes-da-silva/?locale=en)
