import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Календарь</h1>
        <p className="text-sm md:text-base text-gray-600">Управление вашим расписанием и доступностью</p>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar size={20} className="text-tropical-ocean md:w-6 md:h-6" />
            Календарь экскурсий
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] md:min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500 px-4">
            <Calendar size={48} className="mx-auto mb-3 md:mb-4 opacity-50 md:w-16 md:h-16" />
            <p className="text-base md:text-lg font-semibold mb-1 md:mb-2">Календарь в разработке</p>
            <p className="text-xs md:text-sm">Скоро здесь появится интерактивный календарь для управления вашими экскурсиями</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
