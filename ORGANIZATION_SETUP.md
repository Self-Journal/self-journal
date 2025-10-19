# Setting Up SelfJournal GitHub Organization

This guide will help you create a GitHub organization for SelfJournal and transfer the repository.

## Why Create an Organization?

Creating a GitHub organization for SelfJournal provides several benefits:

1. **Professional Image** - `github.com/selfjournal` looks more professional than a personal repo
2. **Team Collaboration** - Easy to add maintainers and contributors
3. **Multiple Repositories** - Organize related projects:
   - `selfjournal/app` - Main application
   - `selfjournal/docs` - Documentation site
   - `selfjournal/templates` - Community templates
   - `selfjournal/mobile` - Native mobile apps (future)
   - `selfjournal/integrations` - Third-party integrations (future)
4. **Branding** - Separate identity from personal projects
5. **Project Management** - Better issue tracking and project boards

## Step-by-Step Setup

### 1. Create the Organization

1. Go to https://github.com/organizations/plan
2. Click "Create organization"
3. Choose "Create a free organization"
4. Fill in the details:
   - **Organization name**: `selfjournal`
   - **Contact email**: your email
   - **This organization belongs to**: "My personal account"
5. Click "Next"
6. Invite members (skip for now, can add later)
7. Complete the setup

### 2. Configure Organization Settings

1. Go to `https://github.com/selfjournal`
2. Click "Settings"
3. Configure:
   - **Profile**: Add description and avatar
   - **Member privileges**: Set default permissions
   - **Repository defaults**: Configure default settings

#### Suggested Profile

- **Name**: SelfJournal
- **Description**: Open-source productivity tools for mindful living
- **URL**: (add later when you have a website/landing page)
- **Email**: your contact email
- **Location**: (optional)
- **Avatar**: Create a logo or use the app icon

### 3. Transfer the Repository

**Option A: Using GitHub CLI**

```bash
# Transfer repository to organization
gh repo edit Self-Journal/self-journal --visibility public
gh api repos/Self-Journal/self-journal/transfer \
  -f new_owner='selfjournal'
```

**Option B: Using GitHub Web Interface**

1. Go to https://github.com/Self-Journal/self-journal
2. Click "Settings"
3. Scroll to the bottom "Danger Zone"
4. Click "Transfer"
5. Enter `selfjournal/selfjournal` as the new repository name
6. Type the repository name to confirm
7. Click "I understand, transfer this repository"

### 4. Update Repository Settings

After transfer, update settings at `https://github.com/selfjournal/selfjournal/settings`:

1. **General**:
   - Add description: "A modern, privacy-first Bullet Journal PWA"
   - Add website: (deployment URL)
   - Add topics: `bullet-journal`, `productivity`, `pwa`, `nextjs`, `typescript`, `self-hosted`
   - Enable Features: Issues, Discussions, Projects

2. **Discussions**:
   - Enable Discussions
   - Create categories:
     - Announcements
     - General
     - Ideas
     - Q&A
     - Show and tell

3. **Security**:
   - Enable Dependabot alerts
   - Enable Dependabot security updates

4. **Collaborators**:
   - Add any team members
   - Set appropriate permissions

### 5. Update Local Repository

After transferring, update your local repository:

```bash
# Navigate to your local repository
cd /Users/lucianfialho/Code/personal/selfjournal

# Update remote URL
git remote set-url origin git@github.com:selfjournal/selfjournal.git

# Verify the change
git remote -v

# Push to verify
git push origin main
```

### 6. Update Documentation

Update references to the new repository URL:

1. **README.md** - Change all `Self-Journal/self-journal` to `selfjournal/selfjournal`
2. **CONTRIBUTING.md** - Update repository URLs
3. **GTM_STRATEGY.md** - Update GitHub links
4. **vercel.json** - Update repository URL
5. **railway.json** - Update repository URL

### 7. Create Additional Repositories (Optional)

Consider creating these repositories under the organization:

```bash
# Create documentation site repository
gh repo create selfjournal/docs --public --description "Documentation for SelfJournal"

# Create templates repository
gh repo create selfjournal/templates --public --description "Community templates for SelfJournal"

# Create design assets repository
gh repo create selfjournal/design --public --description "Design assets and brand guidelines"

# Create landing page repository
gh repo create selfjournal/landing --public --description "Landing page and marketing site"
```

## Future Organization Structure

```
selfjournal/
├── selfjournal          # Main application (this repo)
├── docs                 # Documentation site (VitePress/Docusaurus)
├── templates            # Community templates
├── landing              # Marketing landing page
├── mobile               # Native mobile apps (Capacitor)
├── integrations         # Third-party integrations
├── design               # Design assets and brand
└── .github              # Organization-wide settings
```

## Organization-Wide Files

Create a `.github` repository for organization-wide files:

```bash
gh repo create selfjournal/.github --public --description "Organization-wide GitHub settings"
```

This repository can contain:
- `profile/README.md` - Organization profile
- `FUNDING.yml` - Sponsorship links
- `.github/ISSUE_TEMPLATE/` - Default issue templates
- `.github/PULL_REQUEST_TEMPLATE.md` - Default PR template
- `CODE_OF_CONDUCT.md` - Code of conduct
- `SECURITY.md` - Security policy

## Benefits of This Structure

1. **Clear Separation** - Each project has its own repository
2. **Easy Contribution** - Contributors can focus on specific areas
3. **Better Organization** - Issues and PRs are project-specific
4. **Scalability** - Easy to add new projects
5. **Professional** - Shows commitment and long-term vision

## Next Steps After Organization Setup

1. Create organization logo/avatar
2. Set up GitHub Discussions
3. Create project boards for roadmap
4. Add FUNDING.yml for sponsorships
5. Configure GitHub Pages for docs
6. Set up CI/CD workflows
7. Create community health files
8. Start marketing and community building

## Resources

- [GitHub Organizations Documentation](https://docs.github.com/en/organizations)
- [Transferring a Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)
- [Managing Organization Settings](https://docs.github.com/en/organizations/managing-organization-settings)

---

Need help? Open an issue or discussion in the repository!
