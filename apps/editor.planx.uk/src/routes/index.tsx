import { createFileRoute, redirect } from "@tanstack/react-router"

// Redirect authenticated users to the /app base route
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/app",
      replace: true,
    })
  },
})
