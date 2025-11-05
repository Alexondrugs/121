import { Card, CardContent, CardHeader } from '../components/ui/card'

export default function Projects() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Проекты</h2>
      <Card>
        <CardHeader>
          <div className="font-medium">Канбан</div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Канбан‑доска появится здесь. Перетаскивание задач, колонки и подписки в реальном времени будут добавлены.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


