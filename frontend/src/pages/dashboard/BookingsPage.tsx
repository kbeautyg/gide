import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, Phone, CheckCircle, XCircle } from 'lucide-react'

export default function BookingsPage() {
  // TODO: Загрузка бронирований из API
  const bookings: any[] = []

  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Бронирования</h1>
        <p className="text-sm md:text-base text-gray-600">Управление заказами на ваши экскурсии</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <Calendar size={40} className="mx-auto text-gray-400 mb-3 md:mb-4 md:w-12 md:h-12" />
            <p className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">
              Пока нет бронирований
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Бронирования будут появляться здесь после создания экскурсий
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-base md:text-lg">
                  <span className="line-clamp-2">{booking.tour_title}</span>
                  <span className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full self-start ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'confirmed' && 'Подтверждено'}
                    {booking.status === 'pending' && 'В ожидании'}
                    {booking.status === 'cancelled' && 'Отменено'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Клиент</p>
                      <p className="font-medium text-sm md:text-base truncate">{booking.client_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Телефон</p>
                      <p className="font-medium text-sm md:text-base">{booking.client_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Дата</p>
                      <p className="font-medium text-sm md:text-base">{booking.date}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-4">
                  <Button variant="default" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                    <CheckCircle size={14} className="mr-1 md:mr-2" />
                    Подтвердить
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                    <XCircle size={14} className="mr-1 md:mr-2" />
                    Отменить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
