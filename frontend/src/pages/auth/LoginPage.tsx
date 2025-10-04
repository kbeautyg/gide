import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="text-3xl font-bold text-gradient mb-2 inline-block">
            ThaiGuide Pro
          </Link>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            Войдите для доступа к личному кабинету
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              className="mt-1"
            />
          </div>
          <Button variant="tropical" className="w-full" size="lg">
            Войти
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-tropical-ocean hover:underline font-semibold">
              Зарегистрироваться
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
