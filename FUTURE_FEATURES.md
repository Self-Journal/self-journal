# Future Features - SelfJournal

## Premium Features (Paid Tier)

### 🤖 Smart URL Parser with AI
**Status**: Idea
**Priority**: High
**Target**: Premium/Paid users

#### Description
Sistema inteligente que analisa URLs e automaticamente categoriza e adiciona à Collection apropriada usando web scraping + AI.

#### How it works:
1. User cola um link (produto, artigo, vídeo, etc.)
2. Sistema faz web scraping da página
3. AI analisa o conteúdo e metadados
4. Detecta automaticamente o tipo de conteúdo
5. Adiciona à Collection correta com metadata extraída

#### Use Cases:

**🛍️ Product URLs (Amazon, Mercado Livre, etc.)**
- Detecta: produto, preço, imagem
- Adiciona em: "Wishlist" ou "Things to Buy" collection
- Metadata: preço, loja, rating

**📚 Articles/Blog Posts**
- Detecta: artigo, tempo de leitura, autor
- Adiciona em: "Reading List" collection
- Metadata: autor, site, estimated reading time

**🎬 YouTube/Videos**
- Detecta: vídeo, duração, canal
- Adiciona em: "Watch Later" collection
- Metadata: canal, duração, data publicação

**🎵 Spotify/Music**
- Detecta: música, álbum, artista
- Adiciona em: "Music to Listen" collection
- Metadata: artista, álbum, ano

**📖 Books (Amazon, Goodreads)**
- Detecta: livro, autor, ISBN
- Adiciona em: "Reading List" collection
- Metadata: autor, páginas, rating, ano

**🍕 Recipes**
- Detecta: receita, ingredientes, tempo
- Adiciona em: "Recipes to Try" collection
- Metadata: tempo preparo, dificuldade, porções

#### Technical Implementation:

```typescript
// Future API endpoint
POST /api/smart-url

{
  "url": "https://www.amazon.com/product/...",
  "userId": 123
}

Response:
{
  "type": "product",
  "title": "Product Name",
  "metadata": {
    "price": "$49.99",
    "image": "https://...",
    "rating": 4.5,
    "store": "Amazon"
  },
  "suggestedCollection": "Wishlist",
  "suggestedSymbol": "bullet"
}
```

#### Tech Stack:
- **Web Scraping**: Puppeteer/Playwright para JS rendering
- **AI**: OpenAI GPT-4 ou Claude para análise de conteúdo
- **Metadata**: Open Graph, JSON-LD, schema.org parsing
- **Image extraction**: OG:image, Twitter cards
- **Rate limiting**: Cache de URLs já processadas

#### Premium Tiers:

**Free Tier:**
- 0 smart URL parses/month

**Premium ($5/month):**
- 50 smart URL parses/month
- Categorização automática
- Metadata básica

**Pro ($10/month):**
- Unlimited smart URL parses
- AI-powered categorization
- Full metadata extraction
- Auto-tagging
- Price tracking (produtos)
- Notification quando preço cai

#### Additional Features:
- **Browser Extension**: Botão "Add to BuJo" em qualquer página
- **Mobile Share Sheet**: Compartilhar URL direto do celular
- **Auto-collections**: Se não existir a collection sugerida, criar automaticamente
- **Smart Tags**: AI gera tags relevantes automaticamente
- **Duplicate Detection**: Avisa se URL já foi adicionada
- **Archive Detection**: Se URL está no Wayback Machine

#### Privacy Considerations:
- URLs são processadas server-side
- Opção de delete histórico de URLs
- Não armazena conteúdo scrapeado, apenas metadata
- User pode desabilitar AI analysis (scraping básico apenas)

#### Monetization:
Esta feature justifica o tier pago porque:
1. Usa recursos caros (AI APIs, scraping infrastructure)
2. Economiza tempo significativo do usuário
3. Torna o app mais "mágico" e diferenciado
4. Cria lock-in (quanto mais URLs adicionar, mais valioso fica)

---

## Other Future Ideas

### 🙏 Daily Devotional Space
**Status**: Idea
**Priority**: Medium
**Target**: All users (Free feature with Premium enhancements)

#### Description
Espaço dedicado para reflexões espirituais diárias, leitura bíblica, orações e meditações. Integra prática devocional ao journaling diário.

#### Core Features (Free):

**📖 Daily Scripture Reading**
- Campo para versículo do dia
- Texto da passagem bíblica
- Referência (Livro, Capítulo:Versículo)

**✍️ Personal Reflection**
- Área de texto livre para reflexões
- "O que Deus está falando comigo hoje?"
- "Como aplicar isso na minha vida?"

**🙏 Prayer Journal**
- Lista de pedidos de oração
- Status: Em oração / Respondido / Em andamento
- Data do pedido e data da resposta
- Categorias: Família, Trabalho, Saúde, Outros

**📝 Gratitude Section**
- "Sou grato por..." (3-5 items)
- Integra com mood tracking
- Histórico de gratidão

#### UI/UX Design:

```
┌────────────────────────────────────────┐
│ Daily Devotional - January 18, 2025    │
├────────────────────────────────────────┤
│                                        │
│ 📖 Today's Scripture                   │
│ ┌──────────────────────────────────┐  │
│ │ John 3:16                         │  │
│ │                                   │  │
│ │ "For God so loved the world..."   │  │
│ └──────────────────────────────────┘  │
│                                        │
│ 💭 My Reflection                       │
│ ┌──────────────────────────────────┐  │
│ │ [Área de texto livre]             │  │
│ └──────────────────────────────────┘  │
│                                        │
│ 🙏 Prayer Requests                     │
│ ⚬ Saúde da minha mãe      [Em oração] │
│ ✓ Entrevista de emprego   [Respondido]│
│ ⚬ Paz familiar            [Em oração] │
│ + Add prayer request                   │
│                                        │
│ 🌟 Gratitude                           │
│ • Família saudável                     │
│ • Novo emprego                         │
│ • Dia ensolarado                       │
│                                        │
└────────────────────────────────────────┘
```

#### Premium Features ($5-10/month):

**📚 Bible Integration API**
- Auto-complete para versículos
- Busca por palavra-chave
- Múltiplas traduções (NVI, ARA, ACF, NAA)
- Versículo do dia automático
- Planos de leitura bíblica (1 ano, 90 dias, etc.)

**📖 Reading Plans**
- Planos pré-definidos (Novo Testamento em 90 dias, etc.)
- Checkbox de progresso
- Notificações para lembrar
- Estatísticas de consistência

**🎯 Devotional Streaks**
- Dias consecutivos de devocionais
- Badges e milestones
- "Você está há 30 dias seguidos!"

**📊 Spiritual Growth Analytics**
- Frequência de devocionais
- Orações respondidas vs em andamento
- Temas mais frequentes nas reflexões (AI)
- Correlação mood vs prática devocional

**🤖 AI-Powered Insights (Premium Pro)**
- Análise de padrões nas reflexões
- "Você tem falado muito sobre [tema]"
- Sugestões de versículos baseados em contexto
- Resumo mensal do que Deus tem ensinado

#### Database Schema:

```sql
CREATE TABLE devotionals (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  scripture_reference TEXT, -- "John 3:16"
  scripture_text TEXT,
  reflection TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE TABLE prayer_requests (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  devotional_id INTEGER,
  content TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'answered', 'ongoing')),
  category TEXT, -- 'family', 'work', 'health', 'other'
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  FOREIGN KEY (devotional_id) REFERENCES devotionals(id)
);

CREATE TABLE gratitude_entries (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  devotional_id INTEGER,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (devotional_id) REFERENCES devotionals(id)
);
```

#### Integration Points:

**Daily Page Integration**
- Link "Open Devotional" na Daily page
- Badge se devotional do dia já foi feito
- Quick add: "Add prayer request"

**Dashboard Widget**
- Devotional streak counter
- Próximo versículo do plano de leitura
- Orações ativas (X pending)

**Collections Integration**
- Collection especial "Prayer Requests"
- Collection "Answered Prayers" (histórico)
- Collection "Favorite Verses"

#### Content Partnerships (Future):

**Planos de Leitura:**
- YouVersion Bible App integration
- Daily devotionals de autores conhecidos
- Conteúdo em português (Pão Diário, etc.)

**Community Features:**
- Compartilhar versículo do dia (opcional)
- Pedidos de oração compartilhados (privacidade configurável)
- "Orar junto" - notificar amigos para orar por você

#### Why This Feature?

**User Value:**
- Centraliza prática espiritual com produtividade
- Journaling espiritual comprovadamente benéfico
- Mercado: milhões de cristãos que fazem devotional diário

**Business Value:**
- Diferenciador forte no mercado de journaling apps
- Comunidade engajada (alta retenção)
- Potencial para partnerships com ministérios/igrejas
- Conteúdo premium (planos de leitura, estudos)

**Target Audience:**
- Cristãos praticantes
- Pessoas em jornada espiritual
- Igrejas/grupos pequenos

#### Implementation Priority:

**Phase 1 (MVP):**
- Scripture text field
- Reflection textarea
- Prayer list básica
- Gratitude section

**Phase 2:**
- Bible API integration
- Reading plans
- Devotional streaks

**Phase 3:**
- AI insights
- Community features
- Premium content

---

### 🔄 Task Migration Assistant
- Sugestão automática de tasks para migrar
- Detecção de tasks "velhas" que nunca foram completadas
- Pergunta se user quer migrar ou deletar

### 📊 Advanced Analytics
- Produtividade por hora do dia
- Correlação mood vs completion rate
- Insights semanais/mensais

### 🎨 Custom Themes
- Dark mode variations
- Custom color schemes
- Font choices

### 🔗 Integrations
- Google Calendar sync
- Todoist import
- Notion export

### 📱 Mobile-First Task Management
**Status**: Idea
**Priority**: High
**Target**: All users

#### Vision: Desktop vs Mobile Experience

**🖥️ Desktop = Planning & Analysis**
- Dashboard com analytics
- Heatmaps e visualizações
- Collections management
- Weekly/Monthly planning
- Reflexão e review

**📱 Mobile = Execution & Quick Capture**
- Today's tasks front and center
- Quick add (1-2 taps)
- Swipe gestures para ações
- Widget de home screen
- Notificações inteligentes

#### Core Mobile Features:

**1. Today View (Main Screen)**
```
┌─────────────────────────────────┐
│ Friday, Jan 18                  │
│ ☀️ Good morning!                │
├─────────────────────────────────┤
│ 🎯 Today's Tasks (5)            │
│                                 │
│ ⚬ Buy groceries         [⋮]    │
│ ⚬ Call mom              [⋮]    │
│ ✓ Morning workout       [⋮]    │
│ ⚬ Finish report         [⋮]    │
│ → Team meeting 3pm      [⋮]    │
│                                 │
│ + Quick Add                     │
├─────────────────────────────────┤
│ 😊 How are you feeling?         │
│ [😁] [🙂] [😐] [😟] [😢]        │
└─────────────────────────────────┘
```

**2. Swipe Gestures**
- **Swipe Right** → Mark as complete (✓)
- **Swipe Left** → Options menu (migrate, schedule, delete)
- **Long press** → Edit task
- **Pull down** → Refresh/sync

**3. Quick Actions Menu** (ao tocar [⋮])
```
┌─────────────────────────────────┐
│ ✓ Mark complete                 │
│ → Migrate to tomorrow           │
│ 📅 Schedule for later           │
│ ✏️ Edit                         │
│ 🗑️ Delete                       │
└─────────────────────────────────┘
```

**4. Bottom Navigation**
```
┌─────────────────────────────────┐
│ [Today] [Week] [Collections] [•]│
└─────────────────────────────────┘
  Active   List   Organize    More
```

**5. Floating Action Button (FAB)**
- Big + button always visible
- Opens quick add sheet
- Voice input option
- Camera for notes/receipts

#### Advanced Mobile Features:

**Smart Notifications**
- Morning: "Good morning! You have 5 tasks today"
- Evening: "2 tasks remaining, want to migrate?"
- Streak reminders: "Don't break your 7-day streak!"
- Custom times configuráveis

**Home Screen Widgets**
- **Small**: Task count + quick add
- **Medium**: Today's top 3 tasks
- **Large**: Full today view with checkboxes

**Lock Screen (iOS 16+)**
- Live Activity para task em andamento
- Quick complete from lock screen

**Apple Watch / Wear OS**
- Glance at today's tasks
- Check off completed
- Quick voice capture

**Offline-First**
- Funciona 100% offline
- Sync quando volta online
- Conflict resolution inteligente

**Quick Capture**
- Share sheet: Compartilhar URL → vira task
- Siri/Google Assistant: "Add task..."
- Camera OCR: Foto de nota → texto
- Voice notes: Transcrição automática

#### Mobile-Specific UX Improvements:

**Larger Touch Targets**
- Checkboxes maiores (44x44pt)
- Swipe areas amplas
- Bottom sheet em vez de modals

**One-Handed Usage**
- Actions importantes na parte inferior
- FAB no canto acessível
- Bottom sheets em vez de top modals

**Dark Mode First**
- True black OLED-friendly
- Menos consumo de bateria
- Melhor para uso noturno

**Haptic Feedback**
- Quando completa task (satisfação!)
- Swipe gestures
- Pull to refresh
- Errors/success

#### Implementation Phases:

**Phase 1: PWA Melhorias (Current Web)**
- Responsive mobile layout
- Touch-friendly interactions
- Add to home screen prompt
- Basic offline support
- Service worker

**Phase 2: PWA Avançado**
- Web push notifications
- Background sync
- Share target API
- Install prompts
- Home screen icon

**Phase 3: Native Capabilities (via Capacitor/Expo)**
- Native notifications
- Widgets
- Share sheet integration
- Better offline
- Native gestures

**Phase 4: Full Native Apps**
- iOS Swift/SwiftUI app
- Android Kotlin/Jetpack Compose
- Platform-specific features
- App Store optimization

#### Desktop vs Mobile Feature Matrix:

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Dashboard & Analytics | ⭐⭐⭐⭐⭐ Primary | ⭐⭐ Secondary |
| Today View | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Primary |
| Quick Add | ⭐⭐⭐ Keyboard | ⭐⭐⭐⭐⭐ Voice/Tap |
| Collections | ⭐⭐⭐⭐ Full CRUD | ⭐⭐⭐ Read/Check |
| Weekly Planning | ⭐⭐⭐⭐⭐ Primary | ⭐⭐ Quick view |
| Monthly Review | ⭐⭐⭐⭐⭐ Primary | ⭐⭐ Overview |
| Task Management | ⭐⭐⭐ Detailed | ⭐⭐⭐⭐⭐ Quick |
| Mood Tracking | ⭐⭐⭐ Form | ⭐⭐⭐⭐⭐ Emoji tap |
| Devotionals | ⭐⭐⭐⭐ Long-form | ⭐⭐⭐ Quick read |
| Templates | ⭐⭐⭐⭐⭐ Create | ⭐⭐ Use |
| Search | ⭐⭐⭐⭐ Advanced | ⭐⭐⭐ Basic |
| Settings | ⭐⭐⭐⭐⭐ Full | ⭐⭐⭐ Essential |

#### Why This Approach?

**User Behavior:**
- Morning (mobile): Check what's planned, add tasks on-the-go
- During day (mobile): Quick capture, mark complete
- Evening (desktop): Review day, plan tomorrow, analytics
- Weekend (desktop): Weekly review, collections, planning

**Best of Both Worlds:**
- Desktop: Deep work, reflection, planning
- Mobile: Execution, quick capture, on-the-go

**Business Benefits:**
- Higher engagement (mobile = daily touchpoints)
- Better retention (mobile notifications)
- Premium justification (native apps)
- Cross-platform sync = stickiness

---

### 📱 Native Mobile Apps (Long-term)
- iOS native app (Swift/SwiftUI)
- Android native app (Kotlin/Compose)
- Offline-first architecture
- Platform-specific features
- App Store presence

### 🤝 Collaboration (Future)
- Shared collections
- Family bullet journal
- Team collections

---

**Last Updated**: 2025-01-18
**Maintained by**: Development Team
