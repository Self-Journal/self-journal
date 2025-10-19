# Criar Organização SelfJournal - Passo a Passo

## 🎯 O que vamos fazer

1. Criar organização `selfjournal` no GitHub
2. Transferir o repositório `lucianfialho/selfjournal` para `selfjournal/selfjournal`
3. Atualizar configurações locais
4. Atualizar documentação com novos links

## 📋 Passo 1: Criar a Organização

### Via Interface Web (Mais fácil)

1. Abra: https://github.com/organizations/plan
2. Clique em **"Create organization"**
3. Escolha **"Create a free organization"**
4. Preencha:
   - **Organization name**: `selfjournal`
   - **Contact email**: seu email
   - **This organization belongs to**: "My personal account"
5. Clique **"Next"**
6. Pule o convite de membros (pode fazer depois)
7. Clique **"Complete setup"**

✅ Pronto! Organização criada em `https://github.com/selfjournal`

## 📋 Passo 2: Configurar Profile da Organização

1. Vá para: https://github.com/selfjournal
2. Clique em **"Settings"** (menu superior direito)
3. Na seção **"Profile"**:
   - **Name**: SelfJournal
   - **Description**: Open-source productivity tools for mindful living
   - **Email**: seu email de contato
   - Faça upload de um avatar/logo (pode usar o ícone da app: `public/icon-512.png`)
4. Clique **"Update profile"**

## 📋 Passo 3: Transferir o Repositório

### Opção A: Via GitHub CLI (Mais rápido)

Abra o terminal e execute:

```bash
cd /Users/lucianfialho/Code/personal/selfjournal

# Transferir repositório
gh api repos/lucianfialho/selfjournal/transfer \
  -X POST \
  -f new_owner='selfjournal'
```

### Opção B: Via Interface Web

1. Vá para: https://github.com/lucianfialho/selfjournal
2. Clique em **"Settings"**
3. Desça até **"Danger Zone"** no final da página
4. Clique em **"Transfer"**
5. Em "New owner", digite: `selfjournal`
6. Em "New repository name", deixe: `selfjournal`
7. Digite `lucianfialho/selfjournal` para confirmar
8. Clique **"I understand, transfer this repository"**

✅ Repositório agora está em `https://github.com/selfjournal/selfjournal`

## 📋 Passo 4: Atualizar Repositório Local

No terminal:

```bash
cd /Users/lucianfialho/Code/personal/selfjournal

# Atualizar a URL do remote
git remote set-url origin git@github.com:selfjournal/selfjournal.git

# Verificar mudança
git remote -v

# Testar push
git push origin main
```

Você deve ver:
```
origin  git@github.com:selfjournal/selfjournal.git (fetch)
origin  git@github.com:selfjournal/selfjournal.git (push)
```

## 📋 Passo 5: Configurar Settings do Repositório

1. Vá para: https://github.com/selfjournal/selfjournal/settings

### General Settings

1. Em **"General"**:
   - **Description**: `A modern, privacy-first Bullet Journal PWA`
   - **Website**: (deixe vazio por enquanto, adicione depois do deploy)
   - **Topics**: Clique em ⚙️ e adicione:
     - `bullet-journal`
     - `productivity`
     - `pwa`
     - `nextjs`
     - `typescript`
     - `self-hosted`
     - `mood-tracking`
     - `task-management`

2. Em **"Features"**:
   - ✅ Wikis (desabilitar)
   - ✅ Issues
   - ✅ Sponsorships (habilitar)
   - ✅ Discussions (habilitar)
   - ✅ Projects

3. Clique **"Save changes"**

### Discussions Setup

1. Clique em **"Discussions"** (menu lateral)
2. Clique **"Set up discussions"**
3. Use o template padrão ou customize
4. Categorias sugeridas:
   - 📣 Announcements
   - 💬 General
   - 💡 Ideas & Feature Requests
   - 🙏 Q&A
   - 🎨 Show and Tell
   - 🐛 Bug Reports (redirect para Issues)

### Security & Analysis

1. Em **"Code security and analysis"**:
   - ✅ Dependabot alerts (Enable)
   - ✅ Dependabot security updates (Enable)
   - ✅ Dependabot version updates (Enable - cria PR automático)

## 📋 Passo 6: Atualizar Links na Documentação

Agora precisamos atualizar todos os links de `lucianfialho/selfjournal` para `selfjournal/selfjournal`:

Execute este script no terminal:

```bash
cd /Users/lucianfialho/Code/personal/selfjournal

# Atualizar README.md
sed -i '' 's|lucianfialho/selfjournal|selfjournal/selfjournal|g' README.md

# Atualizar CONTRIBUTING.md
sed -i '' 's|lucianfialho/selfjournal|selfjournal/selfjournal|g' CONTRIBUTING.md

# Atualizar GTM_STRATEGY.md
sed -i '' 's|lucianfialho/selfjournal|selfjournal/selfjournal|g' GTM_STRATEGY.md

# Atualizar vercel.json
sed -i '' 's|lucianfialho/selfjournal|selfjournal/selfjournal|g' vercel.json

# Verificar mudanças
git diff
```

Se tudo estiver OK:

```bash
git add .
git commit -m "docs: update repository URLs after org migration"
git push origin main
```

## 📋 Passo 7: Criar Repositórios Adicionais (Opcional)

Depois que a organização estiver pronta, você pode criar repos adicionais:

```bash
# Documentação
gh repo create selfjournal/docs --public \
  --description "Documentation site for SelfJournal"

# Templates da comunidade
gh repo create selfjournal/templates --public \
  --description "Community templates for SelfJournal"

# Landing page
gh repo create selfjournal/landing --public \
  --description "Marketing landing page"

# Design assets
gh repo create selfjournal/design --public \
  --description "Design assets and brand guidelines"

# .github (org-wide settings)
gh repo create selfjournal/.github --public \
  --description "Organization-wide GitHub configuration"
```

## 📋 Passo 8: Configurar GitHub Sponsors (Opcional)

1. Vá para: https://github.com/organizations/selfjournal/settings/billing/sponsors
2. Clique **"Join the waitlist"** ou **"Set up GitHub Sponsors"**
3. Preencha os dados bancários (ou use Open Collective, Ko-fi)
4. Crie tiers de sponsorship:
   - $5/mês - ☕ Coffee Sponsor
   - $25/mês - 🚀 Pro Sponsor
   - $100/mês - 💎 Organization Sponsor

## ✅ Checklist Final

Após completar todos os passos:

- [ ] Organização `selfjournal` criada
- [ ] Repositório transferido para `selfjournal/selfjournal`
- [ ] Remote local atualizado
- [ ] Settings do repositório configurados
- [ ] Topics adicionados
- [ ] Discussions habilitadas
- [ ] Dependabot habilitado
- [ ] Links da documentação atualizados
- [ ] Commit e push das mudanças

## 🎉 Pronto!

Sua organização está configurada em:
**https://github.com/selfjournal**

Repositório principal:
**https://github.com/selfjournal/selfjournal**

## 🆘 Troubleshooting

### Erro ao transferir repositório

Se der erro ao transferir, verifique:
1. A organização existe e você é owner
2. Não existe outro repo com o mesmo nome na org
3. Você tem permissão de admin no repo original

### Links quebrados após migração

Se alguns links quebrarem:
1. O GitHub redireciona automaticamente por um tempo
2. Mas é melhor atualizar todos os links manualmente
3. Use o script de sed acima para substituir em massa

### Não consigo criar organização

Motivos possíveis:
1. Nome já existe (tente `selfjournal-app` ou similar)
2. Limite de organizações atingido (free plan = ilimitado)
3. Verificação de email pendente

## 📞 Precisa de Ajuda?

Se tiver qualquer problema, me avise que te ajudo a resolver!

---

**Tempo estimado**: 15-20 minutos para completar todos os passos
