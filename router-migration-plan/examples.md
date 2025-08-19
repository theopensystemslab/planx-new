# TanStack Router vs React Router: Comprehensive Comparison (Latest Versions)

## Overview

### TanStack Router (v1.13.x)
- **Type-safe first** routing library with 100% inferred TypeScript support
- **File-based routing** with automatic code generation
- Built-in **search params**, **loaders**, and **caching**
- Integrated **prefetching** and **suspense** support
- Part of the TanStack ecosystem

### React Router (v7.8.1)
- **Multi-strategy router** with three distinct modes: Declarative, Data, and Framework
- **Framework capabilities** inherited from Remix
- **React 18-19 bridge** with modern React features
- **Mature ecosystem** with extensive community support
- Non-breaking upgrade from v6

## Key Differences

| Feature | TanStack Router 1.13 | React Router 7.8.1 |
|---------|---------------------|-------------------|
| **Type Safety** | 100% inferred TypeScript | TypeScript support with manual typing |
| **Route Definition** | File-based + code generation | 3 modes: Declarative/Data/Framework |
| **Search Params** | First-class type-safe APIs | Built-in with useSearchParams |
| **Data Loading** | Integrated loaders with caching | Framework mode with loaders/actions |
| **SSR/Framework** | TanStack Start (separate) | Built-in framework mode |
| **Bundle Size** | ~45kb (full features) | ~13kb (declarative) to ~50kb (framework) |
| **Learning Curve** | Steep (new paradigms) | Gradual (familiar → advanced) |
| **Maturity** | Newer but stable | Very mature |

## React Router 7 Modes

React Router 7 offers three primary modes with additive features:

1. **Declarative Mode**: Traditional component-based routing
2. **Data Mode**: Adds loaders, actions, and data fetching
3. **Framework Mode**: Full-stack capabilities with SSR, bundling, and server functions

## Installation & Setup

### TanStack Router 1.13
```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-devtools @tanstack/router-cli
```

### React Router 7.8.1
```bash
npm install react-router-dom
# For framework mode
npm install @react-router/dev
```

## Basic Setup Examples

### TanStack Router 1.13 Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // Must be first!
    react(),
  ],
})
```

```typescript
// main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent', // Preload on hover/focus
})

// Type registration for full TypeScript inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
```

```typescript
// routes/__root.tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link 
          to="/posts" 
          search={{ page: 1 }} // Type-safe search params
          className="[&.active]:font-bold"
        >
          Posts
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
```

### React Router 7.8.1 Setup (Framework Mode)

```typescript
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  async prerender() {
    return ["/", "/about"];
  },
} satisfies Config;
```

```typescript
// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/contacts">Contacts</Link>
          </nav>
        </div>
        <div id="detail">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### React Router 7.8.1 Setup (Data Mode)

```typescript
// main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Root, { loader as rootLoader } from './routes/root'
import Contact, { loader as contactLoader } from './routes/contact'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: "contacts/:contactId",
        element: <Contact />,
        loader: contactLoader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
```

## Route Definition Patterns

### TanStack Router 1.13 - File-based Routes

```typescript
// routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'

// Type-safe search params validation
type PostsSearch = {
  page?: number
  filter?: string
  sort?: 'asc' | 'desc'
}

export const Route = createFileRoute('/posts')({
  validateSearch: (search: Record<string, unknown>): PostsSearch => ({
    page: Number(search?.page ?? 1),
    filter: (search?.filter as string) || '',
    sort: (search?.sort as 'asc' | 'desc') || 'asc',
  }),
  loader: async ({ search }) => {
    const posts = await fetchPosts({
      page: search.page,
      filter: search.filter,
      sort: search.sort,
    })
    return { posts }
  },
  component: PostsComponent,
  pendingComponent: () => <div>Loading posts...</div>,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
})

function PostsComponent() {
  const { posts } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  
  const updateFilter = (filter: string) => {
    navigate({ 
      search: (prev) => ({ ...prev, filter, page: 1 }),
      replace: true 
    })
  }
  
  return (
    <div>
      <h1>Posts (Page {search.page})</h1>
      <input 
        value={search.filter}
        onChange={(e) => updateFilter(e.target.value)}
        placeholder="Filter posts..."
      />
      {posts.map(post => (
        <Link 
          key={post.id}
          to="/posts/$postId" 
          params={{ postId: post.id }}
        >
          {post.title}
        </Link>
      ))}
    </div>
  )
}
```

```typescript
// routes/posts.$postId.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    if (!post) throw notFound()
    
    return { post }
  },
  component: PostComponent,
  // Type-safe params are automatically inferred!
})

function PostComponent() {
  const { post } = Route.useLoaderData()
  const params = Route.useParams() // { postId: string }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Link to="/posts" search={{ page: 1 }}>
        ← Back to posts
      </Link>
    </article>
  )
}
```

### React Router 7.8.1 - Framework Mode

```typescript
// app/routes/posts.tsx
import { LoaderFunctionArgs, json } from "react-router";
import { useLoaderData, useSearchParams, Link } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const filter = url.searchParams.get("filter") || "";
  
  const posts = await fetchPosts({ page, filter });
  return json({ posts, page, filter });
}

export default function Posts() {
  const { posts, page, filter } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const updateFilter = (newFilter: string) => {
    setSearchParams(prev => {
      prev.set("filter", newFilter);
      prev.set("page", "1");
      return prev;
    }, { replace: true });
  };
  
  return (
    <div>
      <h1>Posts (Page {page})</h1>
      <input 
        value={filter}
        onChange={(e) => updateFilter(e.target.value)}
        placeholder="Filter posts..."
      />
      {posts.map(post => (
        <Link key={post.id} to={`/posts/${post.id}`}>
          {post.title}
        </Link>
      ))}
    </div>
  );
}
```

```typescript
// app/routes/posts.$postId.tsx
import { LoaderFunctionArgs, json } from "react-router";
import { useLoaderData, useParams } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await fetchPost(params.postId!);
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  return json({ post });
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>();
  const params = useParams();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Link to="/posts?page=1">← Back to posts</Link>
    </article>
  );
}
```

### React Router 7.8.1 - Data Mode (SPA)

```typescript
// main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { postsLoader, PostsPage } from './routes/posts'
import { postLoader, PostPage } from './routes/post'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "posts",
        element: <PostsPage />,
        loader: postsLoader,
      },
      {
        path: "posts/:postId",
        element: <PostPage />,
        loader: postLoader,
      },
    ],
  },
])
```

## Common Patterns

### Navigation Patterns

#### TanStack Router
```typescript
import { Link, useNavigate } from '@tanstack/react-router'

// Type-safe navigation
const navigate = useNavigate()

// Programmatic navigation with type safety
navigate({ 
  to: '/posts/$postId', 
  params: { postId: '123' },
  search: { filter: 'react' }
})

// Link with full type safety
<Link 
  to="/posts" 
  search={{ page: 2, filter: 'typescript' }}
  activeProps={{ className: 'font-bold' }}
>
  Posts
</Link>
```

#### React Router 7
```typescript
import { Link, useNavigate } from 'react-router'

const navigate = useNavigate()

// Programmatic navigation
navigate('/posts/123?filter=react')

// Or with search params
navigate('/posts', { 
  search: '?page=2&filter=typescript' 
})

// Link navigation
<Link 
  to="/posts?page=2&filter=typescript"
  className={({ isActive }) => isActive ? 'font-bold' : ''}
>
  Posts
</Link>
```

### Data Loading Patterns

#### TanStack Router - Integrated Loading
```typescript
export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    // Parallel data loading with automatic caching
    const [user, notifications] = await Promise.all([
      fetchUser(),
      fetchNotifications()
    ])
    return { user, notifications }
  },
  // Automatic loading states
  pendingComponent: () => <Spinner />,
  pendingMs: 500, // Show spinner after 500ms
  staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  component: Dashboard,
})

function Dashboard() {
  const { user, notifications } = Route.useLoaderData()
  
  // Data is automatically available and type-safe
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <NotificationList notifications={notifications} />
    </div>
  )
}
```

#### React Router 7 - Framework Mode
```typescript
// app/routes/dashboard.tsx
import { LoaderFunctionArgs, json } from "react-router";
import { useLoaderData, Await, defer } from "react-router";
import { Suspense } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  // Defer slow data
  const user = await fetchUser();
  const notificationsPromise = fetchNotifications();
  
  return defer({
    user,
    notifications: notificationsPromise,
  });
}

export default function Dashboard() {
  const { user, notifications } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Suspense fallback={<div>Loading notifications...</div>}>
        <Await resolve={notifications}>
          {(notifications) => (
            <NotificationList notifications={notifications} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Search Params Management

#### TanStack Router - Type-safe Search
```typescript
// Define search schema
type ProductSearch = {
  category?: string
  price?: { min: number; max: number }
  sort?: 'name' | 'price' | 'rating'
  page?: number
}

export const Route = createFileRoute('/products')({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    category: search.category as string,
    price: search.price as { min: number; max: number },
    sort: (search.sort as ProductSearch['sort']) || 'name',
    page: Number(search.page || 1),
  }),
  component: Products,
})

function Products() {
  const search = Route.useSearch() // Fully typed!
  const navigate = Route.useNavigate()
  
  const updateSearch = (updates: Partial<ProductSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    })
  }
  
  return (
    <div>
      <select 
        value={search.sort}
        onChange={(e) => updateSearch({ sort: e.target.value as ProductSearch['sort'] })}
      >
        <option value="name">Name</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  )
}
```

#### React Router 7 - Search Params Hook
```typescript
import { useSearchParams } from 'react-router'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const sort = searchParams.get('sort') || 'name'
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  
  const updateSort = (newSort: string) => {
    setSearchParams(prev => {
      prev.set('sort', newSort)
      return prev
    }, { replace: true })
  }
  
  return (
    <div>
      <select 
        value={sort}
        onChange={(e) => updateSort(e.target.value)}
      >
        <option value="name">Name</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  )
}
```

### Error Handling

#### TanStack Router
```typescript
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    try {
      const post = await fetchPost(params.postId)
      if (!post) throw notFound()
      return { post }
    } catch (error) {
      throw error
    }
  },
  errorComponent: ({ error, reset }) => (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  ),
  notFoundComponent: () => (
    <div>
      <h2>Post not found!</h2>
      <Link to="/posts">← Back to posts</Link>
    </div>
  ),
})
```

#### React Router 7
```typescript
// app/routes/posts.$postId.tsx
import { LoaderFunctionArgs } from "react-router";
import { isRouteErrorResponse, useRouteError } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await fetchPost(params.postId!);
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  return json({ post });
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Unknown Error</h1>
      <p>{error?.message || "Something went wrong"}</p>
    </div>
  );
}
```

### Form Handling

#### TanStack Router with Actions
```typescript
export const Route = createFileRoute('/contact')({
  component: Contact,
})

function Contact() {
  const navigate = Route.useNavigate()
  
  const handleSubmit = async (formData: FormData) => {
    try {
      await submitContact(formData)
      navigate({ to: '/success' })
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  )
}
```

#### React Router 7 - Actions
```typescript
// app/routes/contact.tsx
import { ActionFunctionArgs, redirect } from "react-router";
import { Form } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const message = String(formData.get("message"));
  
  await submitContact({ email, message });
  return redirect("/success");
}

export default function Contact() {
  return (
    <Form method="post">
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </Form>
  );
}
```

## Advanced Features

### TanStack Router - Advanced Type Safety
```typescript
// Type-safe route masking and params
const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
  beforeLoad: async ({ search }) => {
    // Type-safe beforeLoad hooks
    if (!search.category) {
      throw redirect({ to: '/posts', search: { category: 'all' } })
    }
  },
})

// Context and dependency injection
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.user?.isAdmin) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ context }) => {
    // Access injected dependencies
    return { adminData: await context.adminService.getData() }
  },
})
```

### React Router 7 - Middleware and Guards
```typescript
// app/routes/admin.tsx
export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  
  if (!user?.isAdmin) {
    throw redirect("/login");
  }
  
  const adminData = await fetchAdminData();
  return json({ adminData, user });
}

// Middleware pattern (custom implementation)
function requireAuth(loader: LoaderFunction) {
  return async (args: LoaderFunctionArgs) => {
    const user = await getUserFromSession(args.request);
    if (!user) throw redirect("/login");
    
    return loader({ ...args, user });
  };
}
```

## Performance & Caching

### TanStack Router - Built-in Caching
```typescript
export const Route = createFileRoute('/expensive-route')({
  loader: async () => {
    return await expensiveApiCall()
  },
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  shouldReload: false, // Don't reload on route revisit
})
```

### React Router 7 - Manual Caching
```typescript
// You need to implement your own caching strategy
const cache = new Map();

export async function loader({ params }: LoaderFunctionArgs) {
  const cacheKey = `post-${params.postId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const post = await fetchPost(params.postId!);
  cache.set(cacheKey, json({ post }));
  
  return json({ post });
}
```

## When to Choose Which?

### Choose TanStack Router if:
- **Type safety is critical** - You want 100% type-safe routing
- **Complex search params** - Heavy use of URL state management
- **Developer experience** - You prioritize autocompletion and compile-time safety
- **Modern React patterns** - Building with latest React features
- **Integrated caching** - You want built-in performance optimizations

### Choose React Router 7 if:
- **Proven stability** - You need a battle-tested solution
- **Team familiarity** - Your team knows React Router patterns
- **Gradual adoption** - You want to start simple and add features incrementally
- **Framework features** - You need full-stack capabilities (SSR, actions, etc.)
- **Ecosystem compatibility** - You're using libraries that integrate with React Router

## Migration Considerations

### From React Router v6 to v7
Upgrading from v6 to v7 is a non-breaking upgrade, with three migration paths:
1. **Declarative Mode**: Keep existing component-based routing
2. **Data Mode**: Add loaders and actions incrementally  
3. **Framework Mode**: Full framework with file-based routes

### From React Router to TanStack Router
- Complete rewrite required
- Significant learning curve but improved DX
- Better long-term type safety and maintainability
- Consider for new projects or major refactors

## Conclusion

**React Router 7.8.1** offers incredible flexibility with its three-mode approach, making it suitable for everything from simple SPAs to full-stack applications. It bridges the gap from React 18 to React 19 and provides a clear upgrade path.

**TanStack Router 1.13** excels in type safety and developer experience, offering the most advanced TypeScript integration available in any React router. It's ideal for teams that prioritize type safety and modern development patterns.

Choose based on your team's priorities: proven stability and flexibility (React Router) or cutting-edge type safety and developer experience (TanStack Router).