import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing')({
  component: () => <div>Hello /landing!</div>
})