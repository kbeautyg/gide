import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="text-3xl font-bold text-gradient mb-2 inline-block">
            ThaiGuide Pro
          </Link>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для бронирования экскурсий
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ваше имя"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Номер телефона</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 999-99-99"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (необязательно)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password-confirm">Подтвердите пароль</Label>
            <Input
              id="password-confirm"
              type="password"
              placeholder="Повторите пароль"
              className="mt-1"
            />
          </div>
          <Button variant="tropical" className="w-full" size="lg">
            Зарегистрироваться
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-tropical-ocean hover:underline font-semibold">
              Войти
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link to="/" className="text-gray-600 hover:text-tropical-ocean">
              ← Вернуться на главную
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
