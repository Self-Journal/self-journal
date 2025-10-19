# Bullet Journal - Self-Hosted PWA

Um aplicativo de Bullet Journal self-hosted desenvolvido com Next.js, TypeScript e SQLite. Funciona como Progressive Web App (PWA) para instalação em dispositivos móveis e desktop.

## Características

- **Dashboard de Performance**: Visualize suas métricas de produtividade em tempo real
  - Taxa de conclusão de tarefas
  - Streaks de atividade (dias consecutivos)
  - Breakdown de tarefas por status
  - Atividade dos últimos 30 dias
- **Daily/Weekly/Monthly Logs**: Organize suas tarefas e eventos por dia, semana ou mês
- **Sistema de Símbolos**: Use símbolos clássicos do Bullet Journal com ícones modernos
- **Collections Customizadas**: Crie listas e coleções personalizadas para projetos ou tópicos específicos
- **Index Automático**: Navegue facilmente por todas as suas entradas e coleções
- **PWA**: Instale no seu celular ou computador como um app nativo
- **Self-Hosted**: Seus dados ficam no seu servidor, totalmente privado
- **Autenticação Simples**: Sistema de login com usuário e senha (sem dependências externas)
- **Design Minimalista**: Interface clean em preto e branco, focada no conteúdo
- **Componentes Modernos**: Built with shadcn/ui para uma experiência consistente

## Tecnologias

- **Frontend**: Next.js 15 com TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Database**: SQLite com better-sqlite3
- **Autenticação**: NextAuth.js v5
- **PWA**: next-pwa

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd selfjournal
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Gere os ícones do PWA

```bash
node scripts/create-icons.js
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui-gerado-com-openssl
```

Para gerar um secret seguro:

```bash
openssl rand -base64 32
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## Primeiro Acesso

Na primeira vez que você acessar o aplicativo, será apresentado um wizard de onboarding que:

1. Explica o que é um Bullet Journal
2. Ensina os símbolos utilizados
3. Permite criar sua conta de administrador

## Build para Produção

### Build local

```bash
npm run build
npm start
```

### Docker (opcional)

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build e execute:

```bash
docker build -t bullet-journal .
docker run -p 3000:3000 -v $(pwd)/bulletjournal.db:/app/bulletjournal.db bullet-journal
```

## Deploy

### Opções de Deploy Self-Hosted

1. **VPS (DigitalOcean, Linode, etc.)**
   - Instale Node.js
   - Clone o repositório
   - Configure nginx como reverse proxy
   - Use PM2 para gerenciar o processo

2. **Raspberry Pi**
   - Perfeito para uso doméstico
   - Baixo consumo de energia
   - Acesso via rede local

3. **Docker**
   - Use o Dockerfile fornecido
   - Monte o volume para persistir o banco de dados

### Configuração Nginx (exemplo)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Estrutura do Projeto

```
selfjournal/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação
│   │   ├── entries/      # CRUD de entries (daily/weekly/monthly)
│   │   ├── tasks/        # CRUD de tasks
│   │   ├── collections/  # CRUD de collections
│   │   ├── register/     # Registro de usuários
│   │   └── setup/        # Verificação de setup inicial
│   ├── daily/            # Página de logs diários
│   ├── weekly/           # Página de logs semanais
│   ├── monthly/          # Página de logs mensais
│   ├── collections/      # Página de collections
│   ├── index/            # Página de índice
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── setup/            # Wizard de onboarding
├── components/            # Componentes React
│   └── TaskList.tsx      # Componente de lista de tarefas
├── lib/                   # Utilitários
│   ├── db.ts             # Configuração e operações do SQLite
│   └── auth.ts           # Configuração NextAuth
├── public/               # Arquivos estáticos
│   ├── manifest.json     # Manifest PWA
│   ├── icon-192.png      # Ícone PWA 192x192
│   └── icon-512.png      # Ícone PWA 512x512
├── scripts/              # Scripts utilitários
│   └── create-icons.js   # Geração de ícones
└── bulletjournal.db      # Banco de dados SQLite (criado automaticamente)
```

## Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução. Estrutura:

- **users**: Usuários do sistema
- **entries**: Entradas (daily/weekly/monthly)
- **tasks**: Tarefas associadas às entradas
- **collections**: Coleções customizadas
- **collection_items**: Items das coleções

### Backup

Para fazer backup dos seus dados, simplesmente copie o arquivo `bulletjournal.db`:

```bash
cp bulletjournal.db bulletjournal.db.backup
```

## Símbolos do Bullet Journal

- **• (bullet)**: Tarefa a fazer
- **X (complete)**: Tarefa completa
- **> (migrated)**: Tarefa migrada para outro dia
- **< (scheduled)**: Tarefa agendada
- **− (note)**: Nota ou observação
- **○ (event)**: Evento ou compromisso

## Desenvolvimento

### Adicionar novos recursos

1. Crie as rotas de API necessárias em `app/api/`
2. Atualize o schema do banco em `lib/db.ts`
3. Crie os componentes React em `components/`
4. Adicione as páginas em `app/`

### Estrutura da API

Todas as rotas de API seguem o padrão REST:

- `GET /api/resource` - Listar
- `POST /api/resource` - Criar
- `PUT /api/resource` - Atualizar
- `DELETE /api/resource?id=X` - Deletar

## Segurança

- As senhas são hashadas com bcrypt (10 rounds)
- Sessões JWT via NextAuth.js
- Todas as rotas de API verificam autenticação
- CSRF protection via NextAuth
- SQL injection protection via prepared statements

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

## Suporte

Para reportar bugs ou solicitar features, abra uma issue no GitHub.

## Roadmap

- [ ] Exportação de dados (JSON, Markdown)
- [ ] Importação de dados
- [ ] Temas customizáveis
- [ ] Suporte a anexos/imagens
- [ ] Modo offline completo
- [ ] Sincronização entre dispositivos
- [ ] Tags e filtros
- [ ] Busca full-text
- [ ] Estatísticas e gráficos

## Créditos

Baseado no método Bullet Journal criado por Ryder Carroll.

---

**Self-hosted • Private • Yours forever**
