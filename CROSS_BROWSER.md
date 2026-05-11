# Compatibilidade Cross-Browser — TextFlow

O TextFlow é uma Chrome Extension Manifest V3, compatível com os navegadores baseados em Chromium. Este documento registra os resultados dos testes manuais em cada navegador.

## Navegadores Suportados

| Navegador | Versão Mínima | Base | Status |
|-----------|:------------:|------|:------:|
| Google Chrome | 120+ | Chromium | ✅ Testar |
| Microsoft Edge | 120+ | Chromium | ✅ Testar |
| Brave | 1.60+ | Chromium | ✅ Testar |

## APIs Utilizadas e Compatibilidade

Todas as APIs abaixo são Chromium-standard (presentes em Chrome, Edge e Brave):

| API | Uso no TextFlow | Compatível |
|-----|----------------|:----------:|
| `chrome.storage.local` | Armazenar JWT, estado de auth, configurações | ✅ |
| `chrome.runtime.sendMessage` | Content → background communication | ✅ |
| `chrome.runtime.onMessage` | Background recebe mensagens | ✅ |
| `chrome.runtime.onInstalled` | Inicialização da extensão | ✅ |
| `chrome.commands.onCommand` | Atalho de teclado Ctrl+Shift+T | ✅ |
| `chrome.tabs.query` | Encontrar aba ativa | ✅ |
| `chrome.tabs.sendMessage` | Enviar mensagem do background para content script | ✅ |

## Como Testar

### Google Chrome
1. Abrir `chrome://extensions`
2. Ativar "Modo do desenvolvedor" (canto superior direito)
3. Clicar "Carregar sem compactação"
4. Selecionar a pasta `textflow/extension`
5. Verificar ícones aparecem na barra de ferramentas
6. Testar em qualquer site: selecionar texto → botão flutuante → ação

### Microsoft Edge
1. Abrir `edge://extensions`
2. Ativar "Modo de desenvolvedor" (barra lateral esquerda)
3. Ativar "Permitir extensões de outras lojas" (se solicitado)
4. Clicar "Carregar descompactada"
5. Selecionar a pasta `textflow/extension`
6. Testar em qualquer site

### Brave
1. Abrir `brave://extensions`
2. Ativar "Modo do desenvolvedor" (canto superior direito)
3. Clicar "Carregar sem compactação"
4. Selecionar a pasta `textflow/extension`
5. Testar em qualquer site

## Checklist de Teste Manual

Para cada navegador, verificar:

- [ ] Extensão carrega sem erros no console de DevTools
- [ ] Ícones da extensão visíveis na barra de ferramentas
- [ ] Popup abre ao clicar no ícone
- [ ] Tela de login visível no popup
- [ ] Registro de novo usuário funciona
- [ ] Login funciona
- [ ] Dashboard mostra plano e usos
- [ ] Ao navegar para um site e selecionar texto: botão flutuante aparece
- [ ] Menu de ações abre ao clicar no botão
- [ ] Processar texto (ex: "Resumir") mostra loading e resultado
- [ ] Resultado pode ser copiado (📋 Copiar)
- [ ] Resultado fecha com ✕ ou Escape
- [ ] Ctrl+Shift+T com texto selecionado abre o menu
- [ ] Indicador de quota aparece para usuários free (N/5)
- [ ] Logout funciona e volta para tela de login

## Resultados dos Testes

> Registrar aqui os resultados por navegador após execução.

| Data | Navegador | Versão | Status | Observações |
|------|-----------|--------|:------:|-------------|
| __/__/____ | Chrome | ___ | ⬜ | |
| __/__/____ | Edge | ___ | ⬜ | |
| __/__/____ | Brave | ___ | ⬜ | |

## Problemas Conhecidos

Nenhum no momento. Atualizar esta seção se alguma diferença de comportamento for encontrada.
