# LocalPlanning.services
LocalPlanning.services is a static site generated using Astro, which serves as a directory of PlanX services and a dashboard for ongoing planning applications.

## 🛠️ Tech Stack
- [Astro](https://astro.build/) - Static Site Generator
- [React](https://react.dev/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- Node.js - Runtime environment
- pnpm v10 - Package manager

## 📦 Installation

Install dependencies, and run local dev server

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321 in your browser.


## 🚀 Project structure

Inside the project, you'll see the following folders and files:

```text
├── public/                # Static assets served directly
│   └── favicon.svg        ## Site favicon and other static files
├── src/
│   ├── layouts/           # Page layouts and templates
│   │   └── Layout.astro   ## Base layout component
│   └── pages/             # File-based routing (each file = route)
│       └── index.astro    ## Homepage (becomes /)
├── components/            # Reusable components (Astro, React, Web Components)
├── content/               # Static copy, can be Typescript or MD files
├── lib/                   # External API requests and utility functions, called during build
├── styles/                # Global CSS and Tailwind configurations
└── package.json           # Dependencies and scripts
```

To learn more about the folder structure of an Astro project, refer to [the Astro docs on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🤖 Build / CI

### Deployment Pipeline

LocalPlanning.services is built and deployed automatically via GitHub Actions - 

**Staging**: Triggered on push to `main` branch
- Domain: `https://localplanning.editor.planx.dev`
- Workflow: `.github/workflows/push-main.yml`

**Production**: Triggered on push to `production` branch
- Domain: `https://localplanning.services`
- Workflow: `.github/workflows/push-production.yml`

### Static site generation

The site is pre-rendered at build time using Astro's static generation (SSG) - 

1. **Build command**: `pnpm build --site <domain> --mode <staging|production>`
2. **Data fetching**: Pages query the PlanX API during build to fetch team and service data
3. **Output**: Static HTML, CSS, and JS files in `./dist/`
4. **Infrastructure**: Files are uploaded to S3 and served via CloudFront CDN with extensionless URLs (e.g., `/about` instead of `/about.html`)

**Important**: Content is only updated when the site is rebuilt and redeployed. Changes to team data, applications, or configurations in the PlanX database will not appear on LocalPlanning.services until the next deployment to `main` or `production`.

### Infrastructure

Deployment is managed by Pulumi (`infrastructure/application/services/lps.ts`):

- **S3 Bucket**: Stores built static files
- **CloudFront Distribution**: CDN with custom domain, SSL certificates (ACM), and Origin Access Identity for secure S3 access
- **DNS**: Cloudflare CNAME records pointing to CloudFront

### Pull request previews

PRs trigger preview deployments to temporary Vultr instances at `https://localplanning.<pr-number>.planx.pizza` (see `.github/workflows/pull-request.yml`)