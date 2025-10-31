import { Lock, Eye, Database, Shield, UserCheck, AlertTriangle } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-pink-50">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <Lock size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Политика конфиденциальности
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Мы заботимся о безопасности ваших персональных данных
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Последнее обновление: 7 октября 2025 года
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Intro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="text-indigo-600" size={28} />
                Введение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                ООО «ТайГид» (далее — «мы», «Компания») уважает вашу конфиденциальность и стремится 
                защитить ваши персональные данные. Настоящая Политика конфиденциальности описывает, 
                как мы собираем, используем, храним и защищаем вашу информацию при использовании 
                веб-сайта thaiguide.com (далее — «Сайт») и наших услуг.
              </p>
              <p>
                Используя наш Сайт, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны 
                с какими-либо положениями, пожалуйста, не используйте наш Сайт.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Eye className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm text-blue-900">
                    <strong>Прозрачность:</strong> Мы привержены принципам прозрачности и открытости в 
                    обработке персональных данных. Вы имеете право знать, какие данные мы собираем и как их используем.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Какие данные собираем */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Database className="text-indigo-600" size={28} />
                1. Какие данные мы собираем
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                <strong>1.1. Данные, которые вы предоставляете напрямую:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Регистрационные данные:</strong> имя, фамилия, email, номер телефона, пароль (в зашифрованном виде)</li>
                <li><strong>Данные профиля:</strong> фотография, дата рождения, гражданство, предпочтения</li>
                <li><strong>Данные бронирования:</strong> информация о выбранных экскурсиях, количество участников, специальные пожелания</li>
                <li><strong>Платежные данные:</strong> информация о транзакциях (номера карт обрабатываются через защищенные платежные системы и не хранятся на наших серверах)</li>
                <li><strong>Данные коммуникации:</strong> сообщения в чате поддержки, отзывы, комментарии</li>
              </ul>

              <p className="mt-4">
                <strong>1.2. Данные, собираемые автоматически:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, тип устройства</li>
                <li><strong>Данные использования:</strong> страницы, которые вы посещаете, время на сайте, клики, просмотренные экскурсии</li>
                <li><strong>Cookies:</strong> идентификаторы сессий, настройки языка, рекламные идентификаторы</li>
                <li><strong>Геолокация:</strong> приблизительное местоположение на основе IP-адреса (точная геолокация только с вашего разрешения)</li>
              </ul>

              <p className="mt-4">
                <strong>1.3. Данные из сторонних источников:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Социальные сети:</strong> если вы входите через Facebook, Google и т.д., мы получаем базовую информацию профиля</li>
                <li><strong>Платежные системы:</strong> статус транзакций, данные о платежах</li>
                <li><strong>Партнеры:</strong> информация от наших партнеров (гостиницы, трансферные компании)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Как используем данные */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. Как мы используем ваши данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                <strong>2.1. Предоставление услуг:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Обработка и подтверждение бронирований</li>
                <li>Организация экскурсий и предоставление услуг гидов</li>
                <li>Обработка платежей и возвратов</li>
                <li>Связь с вами по поводу ваших бронирований</li>
                <li>Обработка запросов в службу поддержки</li>
              </ul>

              <p className="mt-4">
                <strong>2.2. Улучшение сервиса:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Анализ использования Сайта для улучшения функциональности</li>
                <li>Персонализация вашего опыта (рекомендации экскурсий)</li>
                <li>Проведение опросов и исследований удовлетворенности</li>
                <li>Разработка новых функций и услуг</li>
              </ul>

              <p className="mt-4">
                <strong>2.3. Маркетинг и коммуникация (только с вашего согласия):</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Отправка информационных писем о новых экскурсиях</li>
                <li>Рекламные акции и специальные предложения</li>
                <li>Персонализированная реклама на сторонних платформах</li>
                <li>Приглашения на события и вебинары</li>
              </ul>

              <p className="mt-4">
                <strong>2.4. Безопасность и соблюдение законодательства:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Предотвращение мошенничества и злоупотреблений</li>
                <li>Обеспечение безопасности Сайта и защита от кибератак</li>
                <li>Соблюдение юридических обязательств</li>
                <li>Разрешение споров и защита прав Компании</li>
              </ul>
            </CardContent>
          </Card>

          {/* С кем делимся данными */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. С кем мы делимся вашими данными</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Мы не продаем ваши персональные данные третьим лицам. Мы можем передавать ваши данные следующим категориям получателей:
              </p>

              <p>
                <strong>3.1. Поставщики услуг:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Гиды и партнеры:</strong> для организации и проведения экскурсий</li>
                <li><strong>Платежные системы:</strong> для обработки платежей (Stripe, PayPal, и др.)</li>
                <li><strong>Хостинг и облачные сервисы:</strong> для хранения данных (AWS, Google Cloud)</li>
                <li><strong>Email-сервисы:</strong> для отправки уведомлений (SendGrid, Mailchimp)</li>
                <li><strong>Аналитика:</strong> Google Analytics, Yandex Metrica (анонимизированные данные)</li>
              </ul>

              <p className="mt-4">
                <strong>3.2. Деловые партнеры:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Гостиницы и трансферные компании (только необходимая информация)</li>
                <li>Страховые компании (для оформления страховки)</li>
                <li>Туристические агентства-партнеры</li>
              </ul>

              <p className="mt-4">
                <strong>3.3. Юридические требования:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Государственные органы по запросу в соответствии с законом</li>
                <li>Суды и правоохранительные органы</li>
                <li>В случае слияния, продажи или реорганизации компании</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm text-amber-900">
                    <strong>Важно:</strong> Все наши партнеры подписывают соглашения о конфиденциальности 
                    и обязуются защищать ваши данные в соответствии с применимым законодательством.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Защита данных */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">4. Как мы защищаем ваши данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Мы применяем современные технологии и организационные меры для защиты ваших персональных данных:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Шифрование:</strong> SSL/TLS для передачи данных, AES-256 для хранения чувствительной информации</li>
                <li><strong>Аутентификация:</strong> многофакторная аутентификация для доступа к системам</li>
                <li><strong>Контроль доступа:</strong> только авторизованные сотрудники имеют доступ к данным</li>
                <li><strong>Мониторинг:</strong> круглосуточный мониторинг систем безопасности</li>
                <li><strong>Резервное копирование:</strong> регулярное создание зашифрованных резервных копий</li>
                <li><strong>Обновления:</strong> своевременное обновление программного обеспечения</li>
                <li><strong>Обучение персонала:</strong> регулярное обучение сотрудников правилам безопасности</li>
              </ul>

              <p className="mt-4">
                Несмотря на наши усилия, ни один метод передачи или хранения данных не является 100% безопасным. 
                В случае утечки данных мы немедленно уведомим вас и соответствующие органы в соответствии с законом.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Cookies и технологии отслеживания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                <strong>5.1. Что такое cookies:</strong> Cookies — это небольшие текстовые файлы, 
                которые сохраняются на вашем устройстве при посещении Сайта.
              </p>

              <p>
                <strong>5.2. Типы cookies, которые мы используем:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Необходимые cookies:</strong> обеспечивают работу основных функций Сайта (нельзя отключить)</li>
                <li><strong>Функциональные cookies:</strong> запоминают ваши настройки (язык, валюта)</li>
                <li><strong>Аналитические cookies:</strong> помогают понять, как вы используете Сайт</li>
                <li><strong>Рекламные cookies:</strong> используются для персонализации рекламы</li>
              </ul>

              <p className="mt-4">
                <strong>5.3. Управление cookies:</strong> Вы можете управлять cookies через настройки 
                вашего браузера. Обратите внимание, что отключение некоторых cookies может ограничить 
                функциональность Сайта.
              </p>
            </CardContent>
          </Card>

          {/* Ваши права */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCheck className="text-indigo-600" size={28} />
                6. Ваши права
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                В соответствии с законодательством о защите персональных данных вы имеете следующие права:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Право на доступ:</strong> получить информацию о том, какие данные мы храним о вас</li>
                <li><strong>Право на исправление:</strong> исправить неточную или неполную информацию</li>
                <li><strong>Право на удаление:</strong> запросить удаление ваших данных («право на забвение»)</li>
                <li><strong>Право на ограничение обработки:</strong> ограничить обработку ваших данных</li>
                <li><strong>Право на переносимость:</strong> получить ваши данные в структурированном формате</li>
                <li><strong>Право на возражение:</strong> возразить против обработки данных в маркетинговых целях</li>
                <li><strong>Право на отзыв согласия:</strong> отозвать согласие на обработку данных в любое время</li>
              </ul>

              <p className="mt-4">
                <strong>Как реализовать свои права:</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Войдите в свой аккаунт и перейдите в настройки</li>
                <li>Или отправьте запрос на email: privacy@thaiguide.com</li>
                <li>Мы рассмотрим ваш запрос в течение 30 дней</li>
                <li>Для подтверждения личности может потребоваться дополнительная информация</li>
              </ol>
            </CardContent>
          </Card>

          {/* Хранение данных */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. Сроки хранения данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Мы храним ваши персональные данные только столько, сколько необходимо для достижения целей, 
                для которых они были собраны:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Данные аккаунта:</strong> до удаления аккаунта или 3 года неактивности</li>
                <li><strong>Данные бронирований:</strong> 5 лет для бухгалтерских целей</li>
                <li><strong>Маркетинговые данные:</strong> до отзыва согласия + 1 год</li>
                <li><strong>Техническая информация:</strong> 2 года</li>
                <li><strong>Данные для разрешения споров:</strong> срок исковой давности + 1 год</li>
              </ul>

              <p className="mt-4">
                После истечения срока хранения данные надежно удаляются или анонимизируются.
              </p>
            </CardContent>
          </Card>

          {/* Дети */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. Защита данных детей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Наш Сайт не предназначен для лиц моложе 18 лет. Мы не собираем намеренно персональные 
                данные детей без согласия родителей или законных представителей.
              </p>
              <p>
                Если вам стало известно, что ребенок предоставил нам свои данные без согласия родителей, 
                пожалуйста, свяжитесь с нами, и мы удалим эту информацию.
              </p>
            </CardContent>
          </Card>

          {/* Международная передача */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. Международная передача данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Ваши данные могут обрабатываться в странах, где расположены наши серверы и партнеры 
                (Российская Федерация, Европейский Союз, США, Таиланд).
              </p>
              <p>
                Мы обеспечиваем адекватный уровень защиты данных при международной передаче с использованием:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Стандартных договорных положений (SCC), одобренных Европейской комиссией</li>
                <li>Сертификации Privacy Shield (для передачи данных в США)</li>
                <li>Других механизмов, предусмотренных законодательством</li>
              </ul>
            </CardContent>
          </Card>

          {/* Изменения */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">10. Изменения в Политике конфиденциальности</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Мы можем периодически обновлять настоящую Политику конфиденциальности. При внесении 
                существенных изменений мы уведомим вас по email или через уведомление на Сайте.
              </p>
              <p>
                Рекомендуем регулярно проверять эту страницу для ознакомления с последней версией Политики.
                Дата последнего обновления указана вверху страницы.
              </p>
            </CardContent>
          </Card>

          {/* Контакты */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-2xl">11. Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Если у вас есть вопросы о настоящей Политике конфиденциальности или об обработке ваших 
                персональных данных, пожалуйста, свяжитесь с нами:
              </p>
              <div className="bg-white p-4 rounded-lg">
                <p><strong>Ответственный за защиту данных:</strong></p>
                <p>Email: privacy@thaiguide.com</p>
                <p>Телефон: +7 (917) 744-51-82</p>
                <p>Почтовый адрес: 123456, г. Москва, ул. Примерная, д. 1</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Вы также имеете право подать жалобу в надзорный орган по защите данных, если считаете, 
                что обработка ваших персональных данных нарушает применимое законодательство.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
