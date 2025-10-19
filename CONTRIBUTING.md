# Contributing to SelfJournal

First off, thank you for considering contributing to SelfJournal! It's people like you that make SelfJournal such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by respect, kindness, and collaboration. By participating, you are expected to uphold this principle.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**
* **List some other apps where this enhancement exists, if applicable**

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

* **Beginner issues** - issues which should only require a few lines of code
* **Help wanted issues** - issues which should be a bit more involved than beginner issues

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the setup instructions** in README.md
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Write clear commit messages** following conventional commits
7. **Submit your pull request**

## Development Process

### Setting Up Development Environment

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/selfjournal.git
cd selfjournal

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

### Coding Standards

#### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object shapes

#### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Use meaningful variable and function names
- Keep functions small and focused

#### Components
- Use functional components with hooks
- Keep components small and reusable
- Extract complex logic into custom hooks
- Use proper TypeScript types for props

#### Git Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug in component
docs: update README
style: format code
refactor: restructure component
test: add unit tests
chore: update dependencies
```

### Testing

Currently, we don't have automated tests, but please manually test:

1. **Functionality** - Does your change work as expected?
2. **Edge cases** - What happens with empty data, invalid input, etc.?
3. **Different views** - Test on mobile, tablet, and desktop
4. **PWA** - Test offline functionality if applicable
5. **Dark mode** - Ensure UI works in both themes

### Database Migrations

If you're adding new database features:

1. Create a migration script in `/scripts/migrate-*.ts`
2. Test migration with existing data
3. Document the changes in the PR description
4. Include rollback instructions if applicable

## Project Structure

```
selfjournal/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   └── [pages]/           # Page components
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [features]/       # Feature components
├── lib/                   # Utilities
│   ├── db.ts             # Database operations
│   └── auth.ts           # Authentication config
├── scripts/              # Migration scripts
└── public/               # Static assets
```

## Areas We Need Help

- **Mobile Testing** - Testing on various mobile devices
- **Performance** - Optimizing database queries and rendering
- **Accessibility** - Making the app more accessible
- **Documentation** - Improving guides and docs
- **Internationalization** - Adding multi-language support
- **Features** - See FUTURE_FEATURES.md for ideas

## Community

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Twitter** - Follow [@lucianfialho](https://twitter.com/lucianfialho) for updates

## Recognition

Contributors will be recognized in:
- The README.md file
- Release notes
- GitHub contributors page

Thank you for contributing to SelfJournal! 🎉
