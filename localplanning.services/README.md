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
`// TODO`