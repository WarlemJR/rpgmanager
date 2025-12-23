# RPG Manager - Clash Style - TODO

## Banco de Dados e Backend
- [x] Definir schema de dados (jogos, personagens, atributos, habilidades)
- [x] Criar migrations do banco de dados
- [x] Implementar rotas tRPC para CRUD de jogos
- [x] Implementar rotas tRPC para CRUD de personagens
- [x] Implementar rotas tRPC para CRUD de atributos
- [x] Implementar rotas tRPC para CRUD de habilidades
- [ ] Escrever testes unitários para rotas backend

## Frontend - Estrutura e Navegação
- [x] Configurar tema Clash Royale (cores, tipografia, espaçamento)
- [x] Criar layout principal com navegação
- [x] Implementar página inicial com lista de jogos
- [x] Criar página de detalhes do jogo com lista de personagens

## Frontend - Funcionalidades de Jogos
- [x] Implementar formulário de criação de novo jogo
- [x] Implementar visualização de jogo
- [x] Implementar edição de jogo
- [x] Implementar exclusão de jogo
- [x] Adicionar validações e feedback visual

## Frontend - Funcionalidades de Personagens
- [x] Implementar formulário de criação de personagem
- [x] Implementar visualização de personagem com história
- [x] Implementar edição de personagem
- [x] Implementar exclusão de personagem
- [x] Adicionar validações e feedback visual

## Frontend - Atributos e Habilidades
- [x] Implementar exibição de atributos com valores padrão
- [x] Implementar controles +/- para ajustar atributos
- [x] Implementar exibição de habilidades
- [x] Implementar CRUD de habilidades
- [x] Adicionar validações de valores mínimos e máximos

## Design e Estilização
- [x] Aplicar paleta de cores Clash Royale
- [x] Criar cards ilustrativos para jogos
- [x] Criar cards ilustrativos para personagens
- [x] Implementar animações de transição
- [x] Implementar micro-interações (hover, click feedback)
- [x] Garantir responsividade em mobile, tablet e desktop
- [x] Adicionar efeitos visuais e sombras

## Testes e Qualidade
- [x] Testar CRUD de jogos
- [x] Testar CRUD de personagens
- [x] Testar controles de atributos
- [x] Testar responsividade
- [x] Testar animações e performance

## Deploy
- [x] Criar checkpoint final
- [x] Preparar para publicação

## Painel Gerencial (Admin)
- [x] Implementar sistema de roles (admin/user)
- [x] Criar página de login para admin
- [x] Criar painel admin com CRUD de jogos
- [ ] Adicionar upload de capa para jogos
- [x] Criar CRUD de personagens no painel admin
- [x] Criar CRUD de atributos no painel admin
- [x] Criar CRUD de habilidades no painel admin
- [x] Proteger rotas admin com autenticação

## Interface Pública (Jogadores)
- [x] Remover botões de editar/deletar para jogadores
- [x] Manter apenas visualização de atributos e habilidades
- [x] Permitir ajuste de atributos com +/- durante o jogo

## Correções e Ajustes
- [x] Corrigir limite máximo de atributos para 15 (valor fixo)

## Upload de Imagens para Capas
- [x] Criar rota tRPC para upload de imagens (S3)
- [x] Adicionar campo de upload na página inicial
- [x] Implementar preview de imagem
- [x] Exibir capas nos cards da página inicial
- [x] Adicionar fallback para jogos sem capa
- [x] Testar upload e exibição de imagens
