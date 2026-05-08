# AGENTS.md — RoadTo26 Mobile

> Leia este arquivo antes de qualquer alteração no repositório.

---

## O que é o RoadTo26

**RoadTo26** é um app mobile social e offline-first para colecionadores de figurinhas inspiradas no álbum da Copa de 2026.

- **Frontend:** Expo + React Native (este repositório)
- **Backend:** Spring Boot — repositório separado: `roadto26-api`
- **Tipo:** App de coleção, ranking, social e troca física de figurinhas
- **Tema:** Copa 2026 sediada por Canadá, México e Estados Unidos (48 seleções)

O RoadTo26 **não é** um produto oficial da FIFA, Panini, Coca-Cola, Adidas ou qualquer entidade relacionada. Não apresentar o app como licenciado ou afiliado. Usar "RoadTo26" como marca própria.

---

## Stack do Mobile

| Lib | Uso |
|---|---|
| Expo + React Native | Base do app |
| Expo Router | Navegação |
| expo-sqlite | Banco local offline |
| TanStack Query | Cache e sincronização de dados |
| Reanimated | Animações |
| Expo Haptics | Feedback háptico |
| expo-camera | Câmera para scanner V1 |
| Expo Linear Gradient | Gradientes visuais |
| lucide-react-native | Ícones |

---

## Arquitetura

- Este repo contém **apenas o app mobile**. Não criar backend aqui.
- O app é **offline-first**. SQLite local é a fonte de verdade.
- Funcionalidades sociais são online via `roadto26-api`.
- Usar `EXPO_PUBLIC_API_BASE_URL` para chamadas HTTP.
- Se `EXPO_PUBLIC_API_BASE_URL` estiver vazio → usar **modo mock/local**.
- Não bloquear o desenvolvimento mobile aguardando o backend.
- Não usar Supabase. Não usar Firebase.

### Separação de camadas

```txt
UI (componentes)
└── hooks (lógica de negócio, TanStack Query)
    └── services (chamadas HTTP / mock)
        └── db (SQLite: schema, seed, queries)

```

Não fazer chamadas de API diretamente dentro de componentes grandes. Não misturar camadas.

---

## Banco Local (SQLite)

Arquivos principais:

- `db/schema.js` — criação e migração de tabelas
- `db/stickers-seed.js` — seed oficial com 994 stickers

O SQLite local gerencia:

- Stickers e status da coleção
- Duplicatas
- Usuário atual e configurações locais
- Histórico de scans
- Fila de sincronização
- Cache social quando necessário

---

## Seed de Figurinhas

**Total: 994 stickers**

| Grupo | Quantidade |
|---|---|
| 48 seleções × 20 stickers | 960 |
| FWC 00 + FWC 1–19 | 20 |
| CC1–CC14 | 14 |
| **Total** | **994** |

### Formato de ID
BRA-1, BRA-2, ..., BRA-20
FWC-00, FWC-1, ..., FWC-19
CC-1, ..., CC-14



### Regras da seed

- Não inventar jogadores
- Preservar acentos e nomes reais
- `number` é sempre string, inclusive `"00"`
- Escudos das seleções → **special foil**
- FWC → **special foil**
- Coca-Cola cards → stickers extras comuns (salvo decisão contrária)
- Não alterar IDs sem necessidade

### Estrutura por seleção (20 slots)

| Slot | Conteúdo |
|---|---|
| 1 | Escudo (special foil) |
| 2–12 | Jogadores 1–11 |
| 13 | Foto da equipe |
| 14–20 | Jogadores 12–18 |

---

## Funcionalidades

### Coleção

- Marcar / desmarcar como coletada
- Adicionar / remover duplicata
- Filtrar por seleção, grupo, status
- Buscar por jogador, seleção ou código
- Ver progresso por seleção e total

### Social (core, não v2)

- Cadastro, login, perfil, avatar gerado
- Ranking global e entre amigos
- Feed de atividade
- Busca e lista de amigos
- Álbum público de outros usuários
- Comparação entre coleções
- Matches para troca física

> O app **não implementa** troca transacional no MVP.  
> Não criar: carrinho de troca, confirmação de entrega, pagamento, escrow, marketplace ou chat obrigatório.

### Trocas e interação entre usuários

No momento, o foco do app é **visibilidade e conversa** entre colecionadores.

O app deve ajudar o usuário a:

- mostrar sua coleção;
- ver o álbum de outras pessoas;
- comparar figurinhas faltantes e duplicadas;
- encontrar possíveis matches de troca;
- iniciar uma conversa ou contato fora do fluxo transacional;
- combinar trocas físicas por conta própria.

A troca deve ser **sempre física**.  
O app não deve funcionar como marketplace, escrow, sistema de pagamento ou intermediador de entrega.

No futuro, o app pode evoluir para:

- pontos de troca por região;
- sugestões de pessoas próximas;
- grupos locais de colecionadores;
- eventos de troca presenciais;
- mapa ou lista de locais seguros para encontro;
- filtros por cidade, bairro ou distância aproximada.

Mesmo no futuro, o app deve continuar tratando a troca como uma interação física entre pessoas, não como transação digital dentro do aplicativo.

#### Comparação inteligente e matches

A feature de matches deve servir para gerar visibilidade e iniciar conversa, não para concluir uma troca dentro do app.

```txt
Você tem 8 figurinhas que faltam para João.
João tem 12 figurinhas que faltam para você.
Vocês têm 5 matches fortes para uma possível troca física.
```


### Feed

Eventos possíveis:
- Usuário marcou figurinha como coletada
- Usuário adicionou duplicata
- Usuário completou uma seleção ou marco de progresso
- Usuário completou todos os escudos ou FWC
- Usuário entrou no ranking ou adicionou amigo

**Agrupar eventos em série:**

✅ `Patrick adicionou 8 novas figurinhas ao álbum.`  
❌ `Patrick colou BRA-4 / Patrick colou BRA-5 / ...`

### Ranking

Rankings planejados: global, entre amigos, por progresso, por quantidade, por seleções completas, por special foils.

Visual: cards, medalhas, destaque para top 3, avatar e barra de progresso. Não usar tabela fria.

### Scanner com Câmera (core da V1)

O scanner é uma funcionalidade **core**, não futura. O app deve nascer com câmera funcional.

#### Fluxo híbrido V1

```
1. Câmera captura a imagem
2. App tenta identificar texto, código, seleção ou slot (OCR)
3. App sugere a figurinha mais provável
4. Usuário confirma ou corrige manualmente
5. App salva como coletada ou duplicata
6. App exibe card visual 3×4 da figurinha escaneada
```

Não depender de lógica frágil (`sem texto = figurinha colada`). Sempre permitir confirmação ou correção manual.

#### O que o scanner deve fazer

- Abrir câmera dentro do app
- Escanear figurinha solta ou colada no álbum físico
- Identificar código, jogador, seleção ou slot
- Comparar resultado com a seed local de 994 stickers
- Marcar automaticamente como **coletada** se for nova
- Somar automaticamente como **duplicata** se já existir
- Registrar histórico de scans
- Indicar tipo: comum, escudo, foto da equipe, FWC, Coca-Cola ou special foil

#### Comportamento esperado

| Cenário | Ação |
|---|---|
| BRA-9 ainda não coletada | Marcar como coletada → exibir card → "Nova figurinha adicionada!" |
| BRA-9 já coletada | Somar +1 duplicata → exibir card → "Repetida adicionada às duplicatas!" |
| Leitura incerta | Sugerir candidatos → usuário confirma → salvar |
| OCR falha | Fallback para busca manual assistida |

#### Card visual 3×4 da figurinha

Sempre que possível, gerar uma visualização modern estilo card 3×4:

- Imagem capturada pela câmera (ou recorte da figurinha)
- Nome do jogador
- Seleção e código do sticker
- Tipo do sticker
- Status: **nova**, **coletada** ou **repetida**
- Efeito foil para special foil
- Bordas, gradiente e sombra — visual premium

O objetivo é transformar o scanner em uma **experiência visual**, não apenas funcional.

#### Evolução futura do scanner (pós-V1)

- OCR otimizado para códigos e textos visíveis
- Reconhecimento por seleção/código/slot
- Leitura de páginas completas do álbum
- Scanner de duplicatas em lote
- Histórico enriquecido com imagens


---

## Rotas (Expo Router)

```txt
app/
├── _layout.jsx
├── index.jsx
├── (auth)/
│ ├── _layout.jsx
│ ├── login.jsx
│ └── register.jsx
├── (app)/
│ ├── _layout.jsx
│ ├── home.jsx
│ ├── album.jsx
│ ├── feed.jsx
│ ├── leaderboard.jsx
│ └── settings.jsx
├── album/
│ └── [teamCode].jsx
├── user/
│ └── [userId].jsx
├── scan/
│ ├── index.jsx
│ └── duplicates.jsx
├── trades.jsx
├── stats.jsx
├── friends.jsx
└── search.jsx
```

---

## Componentes Reutilizáveis

- Avatar.jsx
- UserCard.jsx
- StickerCell.jsx
- LeaderboardPodium.jsx
- ProgressRing.jsx
- ActivityItem.jsx
- TeamCard.jsx
- MatchCard.jsx
- StatusBadge.jsx
- GradientCard.jsx
- EmptyState.jsx
- PrimaryButton.jsx
- LoadingState.jsx
- ScreenHeader.jsx

---

## Identidade Visual

### Tema: dark-first, moderno, premium, esportivo

Paleta de cores:

| Token | Cor | Uso |
|---|---|---|
| Background | Azul noite / quase preto | Base premium |
| Gold | Dourado | Foil, conquistas, progresso |
| Red | Vermelho | Energia, Canadá/México, alertas |
| Green | Verde | Coletado, México, status positivo |
| Blue | Azul | Social, ranking, EUA |
| White | Branco/off-white | Textos principais |
| Gray | Cinza frio | Cards, bordas, divisores |

### Inspiração: três países-sede (abstração visual, não símbolos oficiais)

- **Canadá:** vermelho, branco, frio, organização, norte
- **México:** verde, vermelho, cultura vibrante, textura, calor, festa
- **EUA:** azul, vermelho, estrelas genéricas, arenas, escala, espetáculo

### Estilo preferido

- Cards arredondados com gradientes sutis
- Sombras suaves e glassmorphism leve quando fizer sentido
- Microinterações, haptics, animações curtas
- Skeleton loading, empty states bonitos
- Badges, conquistas, indicadores de progresso visualmente fortes

### Evitar

- Visual genérico de CRUD
- Animações exageradas
- Símbolos oficiais protegidos usados como branding

---

## UX — Requisitos por Tela

Toda tela deve ter: **loading state, empty state, error state, estado offline/online, feedback visual e háptico.**

| Tela | Foco |
|---|---|
| Home | Progresso geral, atalhos, atividade recente |
| Álbum | Cards de seleções, filtros, busca, status visual |
| Seleção | 20 slots, diferenciação de tipos, status visual claro |
| Feed | Clima de rede social leve, avatar, nome, ação, tempo relativo |
| Leaderboard | Pódio top 3, medalhas, ranking amigos e global |
| Perfil | Avatar, progresso, botões de amigo e comparação |
| Matches | Score de compatibilidade, lista detalhada de trocas |

---

## Backend (fora deste repo)

Repo: `roadto26-api` — Spring Boot, Spring Security, JWT, PostgreSQL, Flyway, JPA, Swagger, Docker.

Comunicação via REST: `EXPO_PUBLIC_API_BASE_URL`

Endpoints esperados (futuros):

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/stickers
GET    /api/teams

GET    /api/me/collection
PUT    /api/me/collection/:id
PATCH  /api/me/collection/:id/duplicates

GET    /api/users/search
GET    /api/users/:userId
GET    /api/users/:userId/album

GET    /api/friends
POST   /api/friends/:userId/request
POST   /api/friends/:userId/accept

GET    /api/leaderboard/global
GET    /api/leaderboard/friends

GET    /api/feed

POST   /api/sync/push
GET    /api/sync/pull

```

---

## Prioridade de Desenvolvimento

1. Setup Expo Router
2. Tema visual (tokens, paleta, componentes base)
3. SQLite schema
4. Seed (994 stickers)
5. Auth mock
6. Home
7. Álbum
8. Detalhe da seleção
9. Status de stickers
10. Scanner com câmera V1
11. Card 3×4 da figurinha escaneada
12. Stats
13. Social mockado
14. Matches
15. Feed
16. Leaderboard
17. Integração com Spring Boot
18. Polimento visual

---

## Regras para Agentes de IA

- ✅ Leia este arquivo antes de alterar qualquer código
- ✅ Trabalhe em pacotes pequenos e explique mudanças grandes antes de executar
- ✅ Preserve visual moderno, premium e temático (Copa 2026, três países)
- ✅ Sempre considere estado offline
- ✅ Mantenha o app social e interativo — não é um CRUD simples
- 🚫 Não implemente backend neste repo
- 🚫 Não use Supabase ou Firebase
- 🚫 Não remova SQLite nem offline-first
- 🚫 Não invente dados de stickers
- 🚫 Não use marcas oficiais como se o app fosse licenciado
- 🚫 Não faça refatorações gigantes sem necessidade
- 🚫 Não apague dados locais do usuário sem confirmação explícita

---

## Tom de Produto

> "Meu álbum da Copa, meus amigos, minha corrida até completar tudo."

O usuário deve sentir:
- Quero completar minha coleção
- Quero comparar com meus amigos
- Quero subir no ranking
- Quero achar quem tem minhas faltantes
- Quero mostrar meu progresso
- Quero sentir clima de Copa
- Quero usar mesmo antes do backend estar pronto