import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, Phone, CheckCircle, XCircle } from 'lucide-react'

export default function BookingsPage() {
  // TODO: Загрузка бронирований из API
  const bookings: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Бронирования</h1>
        <p className="text-gray-600">Управление заказами на ваши экскурсии</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Пока нет бронирований
            </p>
            <p className="text-sm text-gray-500">
              Бронирования будут появляться здесь после создания экскурсий
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{booking.tour_title}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
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
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Клиент</p>
                      <p className="font-medium">{booking.client_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Телефон</p>
                      <p className="font-medium">{booking.client_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Дата</p>
                      <p className="font-medium">{booking.date}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="default" size="sm">
                    <CheckCircle size={16} className="mr-2" />
                    Подтвердить
                  </Button>
                  <Button variant="outline" size="sm">
                    <XCircle size={16} className="mr-2" />
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
