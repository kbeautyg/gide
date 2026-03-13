# Настройка GitHub Webhook

Чтобы сайт обновлялся автоматически при пуше (как на Railway), сделайте следующее:

1.  Зайдите в репозиторий на GitHub: https://github.com/kbeautyg/gide
2.  Перейдите в **Settings** -> **Webhooks**.
3.  Нажмите кнопку **Add webhook**.
4.  Заполните поля:
    *   **Payload URL**: `https://ВАШ-ДОМЕН/webhook` (например, `https://gide.ru/webhook`)
    *   **Content type**: `application/json`
    *   **Secret**: `my_webhook_secret` (или то, что вы указали в файле .env на сервере)
5.  В разделе "Which events would you like to trigger this webhook?" выберите **Just the push event**.
6.  Нажмите **Add webhook**.

Теперь при каждом `git push` GitHub будет стучаться на ваш сервер, а сервер будет обновлять сам себя.

