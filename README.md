# RoadTo26

**RoadTo26** é um app mobile moderno para colecionadores de figurinhas da Copa de 2026.  
A ideia é unir **álbum digital**, **scanner**, **controle de coleção**, **duplicatas**, **ranking**, **feed social**, **perfil de usuários** e **comparação entre amigos**.

O app foi pensado como uma experiência **offline-first + social online**:

- O usuário consegue usar o álbum localmente mesmo sem internet.
- As funcionalidades sociais usam backend quando houver conexão.
- A coleção local é sincronizada com o servidor quando possível.
- A seed oficial das figurinhas fica tanto no app quanto no backend.

---

## Índice

- [Visão geral](#visão-geral)
- [Nome do projeto](#nome-do-projeto)
- [Objetivo do app](#objetivo-do-app)
- [Funcionalidades principais](#funcionalidades-principais)
- [Stack planejada](#stack-planejada)
- [Arquitetura geral](#arquitetura-geral)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Seed das figurinhas](#seed-das-figurinhas)
- [Banco local SQLite](#banco-local-sqlite)
- [Backend](#backend)
- [Sincronização](#sincronização)
- [Telas planejadas](#telas-planejadas)
- [Instalação do ambiente](#instalação-do-ambiente)
- [Criando o projeto Expo](#criando-o-projeto-expo)
- [Instalando dependências](#instalando-dependências)
- [Rodando o app](#rodando-o-app)
- [Modo mock](#modo-mock)
- [Roadmap de desenvolvimento](#roadmap-de-desenvolvimento)
- [Ideias futuras](#ideias-futuras)

---

## Visão geral

O **RoadTo26** é um app para quem quer controlar um álbum de figurinhas da Copa de 2026 de forma mais inteligente.

Em vez de depender de papel, anotações ou planilhas, o usuário pode:

- Ver todas as figurinhas do álbum.
- Marcar quais já tem.
- Marcar duplicatas.
- Ver quais faltam.
- Comparar a coleção com amigos.
- Ver quem tem figurinhas que faltam para ele.
- Ver quem precisa das duplicatas dele.
- Acompanhar ranking de colecionadores.
- Ver feed de atividade.
- Usar scanner para acelerar marcações.

---

## Nome do projeto

Nome escolhido:

```txt
RoadTo26
```

Motivo:

- Tem ligação direta com a Copa de 2026.
- Passa ideia de jornada até completar o álbum.
- Funciona bem em inglês.
- Tem cara de app moderno.
- Não usa nomes oficiais protegidos como FIFA ou World Cup.
- Combina com ranking, progresso, metas e comunidade.

Possíveis variações visuais:

```txt
RoadTo26
Road to 26
ROAD26
Road26
```

Nome recomendado no código:

```txt
roadto26
```

Nome recomendado para pasta:

```txt
roadto26-mobile
roadto26-api
```

---

## Objetivo do app

Criar um app completo para colecionadores de figurinhas da Copa de 2026, com:

1. Controle individual da coleção.
2. Uso offline.
3. Sincronização online.
4. Perfis sociais.
5. Ranking.
6. Feed de atividades.
7. Comparação de coleção.
8. Sugestão de trocas presenciais.

Importante: o app **não precisa realizar trocas dentro dele**.  
A ideia é auxiliar o usuário a descobrir oportunidades de troca, mas a troca real acontece fisicamente entre as pessoas.

---

## Funcionalidades principais

### Coleção

- Listar todas as figurinhas.
- Filtrar por seleção.
- Filtrar por grupo.
- Filtrar por status:
  - faltando;
  - coletada;
  - duplicada.
- Ver detalhes de cada figurinha.
- Marcar figurinha como coletada.
- Adicionar/remover duplicatas.
- Ver progresso geral do álbum.
- Ver progresso por seleção.
- Ver quantidade de especiais/foils.

### Scanner

- Scanner principal para identificar figurinhas.
- Scanner de duplicatas.
- Histórico de scans.
- Registro de acurácia ou confiança do scan.
- Possibilidade de confirmação manual.

### Social

- Cadastro e login.
- Perfil de usuário.
- Avatar gerado automaticamente.
- Ver álbum de outros usuários.
- Lista de amigos.
- Busca de usuários.
- Comparar coleção com amigos.
- Ver quem tem o que falta para você.
- Ver quem precisa das suas duplicatas.

### Ranking

- Ranking global.
- Ranking entre amigos.
- Critérios possíveis:
  - total de figurinhas coletadas;
  - porcentagem completa;
  - especiais coletadas;
  - seleções completas;
  - maior número de duplicatas.

### Feed

Eventos possíveis:

- Usuário colou uma figurinha.
- Usuário completou uma seleção.
- Usuário atingiu uma marca de progresso.
- Usuário completou todos os escudos.
- Usuário completou uma página especial.
- Usuário entrou no app.
- Usuário adicionou duplicatas.

Para evitar spam, eventos comuns podem ser agrupados.

Exemplo:

```txt
Patrick marcou 8 novas figurinhas.
Patrick completou Brazil.
Patrick chegou a 72% do álbum.
```

---

## Stack planejada

### Mobile

```txt
React Native
Expo
Expo Router
expo-sqlite
TanStack Query
NetInfo
React Native Reanimated
Expo Haptics
Expo Linear Gradient
Lucide React Native
```

### Backend

```txt
Java
Spring Boot
Spring Security
JWT
JPA/Hibernate
MySQL ou PostgreSQL
```

### Desenvolvimento

```txt
Node.js LTS
npm
VS Code
Expo Go
Git
```

---

## Arquitetura geral

O projeto pode ser separado em dois projetos:

```txt
roadto26/
├── mobile/
│   └── React Native + Expo
│
└── backend/
    └── Spring Boot API
```

Ou em repositórios separados:

```txt
roadto26-mobile/
roadto26-api/
```

Recomendação inicial:

```txt
roadto26-mobile
roadto26-api
```

Isso deixa mobile e backend independentes.

---

## Estrutura de pastas

Estrutura planejada para o app mobile:

```txt
roadto26-mobile/
├── app/
│   ├── _layout.jsx
│   ├── index.jsx
│   │
│   ├── (auth)/
│   │   ├── _layout.jsx
│   │   ├── login.jsx
│   │   └── register.jsx
│   │
│   ├── (app)/
│   │   ├── _layout.jsx
│   │   ├── home.jsx
│   │   ├── album.jsx
│   │   ├── feed.jsx
│   │   ├── leaderboard.jsx
│   │   └── settings.jsx
│   │
│   ├── album/
│   │   └── [teamCode].jsx
│   │
│   ├── user/
│   │   └── [userId].jsx
│   │
│   ├── scan/
│   │   ├── index.jsx
│   │   └── duplicates.jsx
│   │
│   ├── trades.jsx
│   ├── stats.jsx
│   ├── friends.jsx
│   └── search.jsx
│
├── components/
│   ├── Avatar.jsx
│   ├── StickerCell.jsx
│   ├── ProgressRing.jsx
│   ├── TeamCard.jsx
│   ├── StatusBadge.jsx
│   └── EmptyState.jsx
│
├── constants/
│   └── theme.js
│
├── db/
│   ├── schema.js
│   └── stickers-seed.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useTheme.js
│   ├── useSyncWorker.js
│   ├── useCollection.js
│   ├── useFriends.js
│   └── useLeaderboard.js
│
├── services/
│   ├── api.js
│   ├── collectionService.js
│   ├── syncService.js
│   └── scannerService.js
│
├── utils/
│   ├── dates.js
│   ├── numbers.js
│   ├── validation.js
│   └── stickerUtils.js
│
├── assets/
├── app.json
├── package.json
└── README.md
```

---

## Seed das figurinhas

A seed é a lista principal de figurinhas do álbum.

Ela deve ficar primeiro no app mobile:

```txt
db/stickers-seed.js
```

Exemplo:

```js
export const STICKERS_SEED = [
  {
    id: "BRA-1",
    teamCode: "BRA",
    teamName: "Brazil",
    number: "1",
    name: "Brazil Badge",
    type: "BADGE",
    groupCode: "G",
    isSpecialFoil: true
  },
  {
    id: "BRA-2",
    teamCode: "BRA",
    teamName: "Brazil",
    number: "2",
    name: "Alisson",
    type: "PLAYER",
    groupCode: "G",
    isSpecialFoil: false
  }
];
```

### Padrão recomendado

Usar `number` como string para todos os stickers:

```js
number: "1"
number: "2"
number: "00"
```

Motivo:

- Evita conflito entre `00` e `0`.
- Facilita display.
- Mantém consistência.
- Evita mistura de `number` e `string`.

### Total planejado

```txt
48 seleções × 20 stickers = 960
FWC 00 + 1-19 = 20
CC 1-14 = 14
Total = 994 stickers
```

### Special foil

```txt
48 escudos das seleções
20 FWC
Total = 68 special foil
```

---

## Banco local SQLite

O app é offline-first.  
Por isso, o SQLite local é essencial.

Arquivo:

```txt
db/schema.js
```

Tabelas principais:

```txt
stickers
sticker_status
current_user
friends
friend_albums
scan_history
```

Tabelas locais internas:

```txt
_settings
_sync_queue
_search_cache
```

### stickers

Master data das figurinhas.

```txt
id
team_code
team_name
number
name
type
group_code
is_special_foil
```

Essa tabela é alimentada pela seed.

### sticker_status

Estado da coleção do usuário.

```txt
user_id
sticker_id
status
duplicate_count
collected_at
updated_at
is_synced
```

Status possíveis:

```txt
missing
collected
duplicate
```

### current_user

Usuário logado no aparelho.

```txt
id
username
display_name
avatar_seed
token
refresh_token
created_at
updated_at
```

### friends

Cache local dos amigos confirmados.

```txt
id
username
display_name
avatar_seed
progress_percent
last_seen_at
```

### friend_albums

Cache do álbum de amigos.

```txt
friend_id
sticker_id
status
duplicate_count
updated_at
```

### scan_history

Histórico de scans.

```txt
id
user_id
scanned_at
mode
detected_count
accuracy
raw_result_json
```

### _settings

Configurações locais.

```txt
key
value
updated_at
```

Exemplos:

```txt
theme
notifications_enabled
last_sync_at
mock_mode
```

### _sync_queue

Fila de sincronização.

```txt
id
operation
payload_json
status
attempt_count
created_at
updated_at
last_error
```

Operações possíveis:

```txt
UPSERT_STICKER_STATUS
DELETE_STICKER_STATUS
CREATE_SCAN_HISTORY
UPDATE_PROFILE
```

---

## Backend

O backend será criado separadamente, provavelmente em Spring Boot.

Estrutura sugerida:

```txt
roadto26-api/
├── src/main/java/com/roadto26/api/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   ├── security/
│   └── config/
│
└── src/main/resources/
    ├── application.properties
    └── stickers-seed.json
```

### Entidades principais

```txt
User
Sticker
StickerStatus
Friendship
ActivityEvent
RefreshToken
```

### Controllers principais

```txt
AuthController
UserController
StickerController
CollectionController
FriendController
LeaderboardController
FeedController
SyncController
```

### Endpoints planejados

Auth:

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

Usuário:

```txt
GET /me
PATCH /me
GET /users/{id}
GET /users/search?q=
```

Stickers:

```txt
GET /stickers
GET /stickers/{id}
GET /teams
```

Coleção:

```txt
GET /me/collection
PUT /me/collection/{stickerId}
DELETE /me/collection/{stickerId}
```

Amigos:

```txt
GET /friends
POST /friends/{userId}
DELETE /friends/{userId}
```

Álbum de outro usuário:

```txt
GET /users/{id}/album
GET /users/{id}/collection-summary
```

Matches:

```txt
GET /matches/missing
GET /matches/duplicates
GET /matches/with/{userId}
```

Ranking:

```txt
GET /leaderboard/global
GET /leaderboard/friends
```

Feed:

```txt
GET /feed
GET /users/{id}/feed
```

Sync:

```txt
POST /sync/push
GET /sync/pull
```

---

## Sincronização

Estratégia escolhida:

```txt
server-authoritative + sync_queue local + last-write-wins
```

Funcionamento:

1. Usuário altera a coleção localmente.
2. A alteração salva no SQLite.
3. Uma operação entra na `_sync_queue`.
4. Quando houver internet, o app envia a fila para o backend.
5. O servidor valida e salva.
6. O app marca a operação como sincronizada.
7. Em conflito, vence a alteração mais recente por timestamp.

### Por que essa estratégia?

- Simples para MVP.
- Funciona offline.
- Não trava o usuário.
- Aceita backend futuro.
- Evita complexidade excessiva.

---

## Telas planejadas

### Auth

```txt
Login
Register
```

Com:

- visual moderno;
- gradiente;
- avatar gerado;
- inputs animados;
- loading state;
- feedback haptico.

### App principal

```txt
Home
Album
Feed
Leaderboard
Settings
```

### Extras

```txt
Scanner
Scanner de duplicatas
Detalhe da seleção
Perfil de outro usuário
Friends
Search
Trades/Matches
Stats
```

---

## Instalação do ambiente

Instalar:

```txt
Node.js LTS
VS Code
Git
Expo Go no celular
```

Opcional:

```txt
Android Studio
Visual Studio Build Tools
```

Para começar com Expo, o essencial é:

```txt
Node.js
npm
VS Code
Expo Go
```

---

## Criando o projeto Expo

Comando recomendado:

```bash
npx create-expo-app@latest roadto26-mobile --template blank
```

Entrar na pasta:

```bash
cd roadto26-mobile
```

Abrir no VS Code:

```bash
code .
```

Rodar:

```bash
npx expo start
```

---

## Instalando dependências

Dependências Expo:

```bash
npx expo install expo-router expo-sqlite expo-status-bar expo-haptics expo-linear-gradient react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @react-native-community/netinfo
```

Dependências npm:

```bash
npm install @tanstack/react-query lucide-react-native
```

Configurar `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

---

## Rodando o app

```bash
npx expo start
```

Depois:

- Abrir Expo Go no celular.
- Escanear o QR Code.
- Testar o app.

---

## Modo mock

No começo, o app pode funcionar sem backend.

Se a variável de ambiente abaixo estiver vazia:

```txt
EXPO_PUBLIC_API_BASE_URL
```

O app entra em modo mock.

Nesse modo:

- login funciona localmente;
- cadastro funciona localmente;
- sync simula sucesso;
- telas sociais podem usar dados fake;
- app inteiro pode ser desenvolvido antes do backend.

Quando o backend existir:

```txt
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

ou, em produção:

```txt
EXPO_PUBLIC_API_BASE_URL=https://api.roadto26.com
```

---

## Roadmap de desenvolvimento

### Fase 1 — Setup

- Criar projeto Expo.
- Instalar dependências.
- Configurar Expo Router.
- Criar tema.
- Criar layout root.
- Criar splash/boot inicial.

### Fase 2 — Banco local

- Criar `db/schema.js`.
- Criar `db/stickers-seed.js`.
- Rodar migrations.
- Inserir seed no SQLite.
- Criar helpers de consulta.

### Fase 3 — Auth mock

- Criar `useAuth`.
- Criar login.
- Criar register.
- Criar current_user local.
- Criar logout.

### Fase 4 — Álbum

- Tela Home.
- Tela Album.
- Tela de seleção.
- Componente StickerCell.
- Marcar como coletada.
- Marcar duplicata.
- Filtros e busca.

### Fase 5 — Estatísticas

- Progresso geral.
- Progresso por seleção.
- Especiais coletadas.
- Duplicatas.
- Faltantes.

### Fase 6 — Social mockado

- Feed fake.
- Leaderboard fake.
- Amigos fake.
- Perfil de usuário fake.
- Comparação de coleções fake.

### Fase 7 — Scanner

- Tela de scanner.
- Scanner manual inicialmente.
- Histórico de scans.
- Scanner de duplicatas.

### Fase 8 — Backend

- Criar projeto Spring Boot.
- Criar banco.
- Criar entidades.
- Criar auth JWT.
- Importar seed no backend.
- Criar endpoints.
- Conectar mobile na API.

### Fase 9 — Sync real

- Implementar push da sync queue.
- Implementar pull do servidor.
- Resolver conflitos.
- Atualizar feed/ranking.

### Fase 10 — Polimento

- Animações.
- Haptics.
- Empty states.
- Skeleton loading.
- Dark/light mode.
- Ajustes de performance.
- Build de produção.

---

## Ideias futuras

- Upload de avatar.
- Chat ou contato entre usuários.
- QR Code de perfil.
- Grupos de troca por escola/faculdade/bairro.
- Notificações push.
- Badges/conquistas.
- Eventos especiais.
- Ranking por cidade.
- Ranking por grupo de amigos.
- Compartilhar progresso no Instagram.
- Exportar lista de faltantes.
- Exportar lista de duplicatas.
- Modo “dia de troca”.
- Sugestão automática de melhores pessoas para trocar.
- Scan por câmera com OCR ou IA.
- Modo família/múltiplos álbuns.
- Tema especial para seleções.
- Página de “álbum completo” compartilhável.

---

## Regra de ouro do projeto

Não travar no backend no começo.

A ordem ideal é:

```txt
1. Fazer o app funcionar localmente
2. Fazer o álbum aparecer
3. Fazer coleção/duplicatas funcionarem
4. Fazer telas sociais mockadas
5. Criar backend depois
6. Plugar sync real
```

Assim o projeto anda visualmente e funcionalmente desde cedo.

---

## Resumo final

**RoadTo26** será um app mobile moderno para colecionadores da Copa de 2026, com álbum offline, scanner, progresso, duplicatas, ranking, feed, amigos e comparação social.

A seed começa no mobile em:

```txt
db/stickers-seed.js
```

O banco local é criado em:

```txt
db/schema.js
```

O backend virá depois como projeto separado:

```txt
roadto26-api
```

E a arquitetura final será:

```txt
mobile offline-first
+
backend social online
+
sync queue
+
seed compartilhada
```
