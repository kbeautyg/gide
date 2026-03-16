#!/bin/bash
# Скачивает ВСЕ фото с Railway на LiteHost
# Запуск: curl -sL URL | bash
set -e

API="https://gide-production.up.railway.app"
DIR="/var/www/static"
mkdir -p "$DIR"

echo "=== Скачиваем ВСЕ фото ==="

# 1. Ставим python3 если нет
which python3 > /dev/null 2>&1 || apt install -y -qq python3 > /dev/null 2>&1

# 2. Собираем ВСЕ URL фоток через пагинацию
echo "[1/3] Собираем список фото..."
PAGE=1
> /tmp/all_urls.txt

while true; do
  DATA=$(curl -sL "${API}/api/v1/tours/?page=${PAGE}&page_size=100" 2>/dev/null)

  COUNT=$(echo "$DATA" | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  tours=d.get('tours',[])
  if not tours:
    print(0)
    sys.exit()
  for t in tours:
    for p in t.get('photos',[]):
      if p.startswith('/static/'):
        print(p,file=sys.stderr)
  print(len(tours))
except:
  print(0)
" 2>> /tmp/all_urls.txt)

  if [ "$COUNT" = "0" ] || [ -z "$COUNT" ]; then
    break
  fi

  echo "  Страница ${PAGE} — ${COUNT} туров"
  PAGE=$((PAGE + 1))

  # Защита от бесконечного цикла
  if [ "$PAGE" -gt 500 ]; then
    break
  fi
done

# Добавляем фото статей
echo "  Статьи..."
curl -sL "${API}/api/v1/articles/?limit=500" 2>/dev/null | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  for a in d.get('articles',[]):
    u=a.get('photo_url','')
    if u.startswith('/static/'): print(u)
except: pass
" >> /tmp/all_urls.txt 2>/dev/null

# Убираем дубли
sort -u /tmp/all_urls.txt > /tmp/urls_unique.txt
TOTAL=$(wc -l < /tmp/urls_unique.txt)
echo "  Всего уникальных фото: ${TOTAL}"

# 3. Скачиваем
echo "[2/3] Скачиваем фото..."
COUNT=0
FAIL=0
while IFS= read -r url; do
  COUNT=$((COUNT + 1))
  DEST="${DIR}${url}"

  # Пропускаем если уже есть
  if [ -f "$DEST" ] && [ -s "$DEST" ]; then
    if [ $((COUNT % 500)) -eq 0 ]; then
      echo "  ${COUNT}/${TOTAL} (пропуск существующих)..."
    fi
    continue
  fi

  DDIR="${DEST%/*}"
  mkdir -p "$DDIR"
  curl -sL "${API}${url}" -o "$DEST" 2>/dev/null

  if [ ! -s "$DEST" ]; then
    rm -f "$DEST"
    FAIL=$((FAIL + 1))
  fi

  if [ $((COUNT % 200)) -eq 0 ]; then
    echo "  ${COUNT}/${TOTAL}..."
  fi
done < /tmp/urls_unique.txt

echo "  Скачано: $((COUNT - FAIL))  Ошибок: ${FAIL}"

# 4. Перезапускаем nginx
echo "[3/3] Nginx..."
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null

# Итого
SIZE=$(du -sh "$DIR" | cut -f1)
echo ""
echo "==============================="
echo "  ГОТОВО! Размер: ${SIZE}"
echo "==============================="
echo "Проверь: curl -I http://91.230.94.240/static/tours/1/photo.jpg"

rm -f /tmp/all_urls.txt /tmp/urls_unique.txt /tmp/tours.json /tmp/articles.json
