import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Календарь</h1>
        <p className="text-gray-600">Управление вашим расписанием и доступностью</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={24} className="text-tropical-ocean" />
            Календарь экскурсий
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Calendar size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">Календарь в разработке</p>
            <p className="text-sm">Скоро здесь появится интерактивный календарь для управления вашими экскурсиями</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
