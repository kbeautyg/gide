"""
SEO endpoints - sitemap.xml и другие SEO файлы
"""
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.db.session import get_db
from app.models.tour import Tour

router = APIRouter()

FRONTEND_URL = "https://thaiguide-frontend-production.up.railway.app"

# Популярные города для sitemap
POPULAR_CITIES = [
    # Таиланд
    "Бангкок", "Пхукет", "Паттайя", "Краби", "Чиангмай", "Самуи",
    # ОАЭ
    "Дубай", "Абу-Даби", "Шарджа",
    # Япония
    "Токио", "Киото", "Осака", "Нара",
    # Китай
    "Пекин", "Шанхай", "Гонконг", "Чжанцзяцзе",
    # Индия
    "Дели", "Гоа", "Мумбаи", "Агра", "Джайпур",
    # Вьетнам
    "Ханой", "Хошимин", "Дананг", "Нячанг",
    # Индонезия
    "Бали", "Убуд", "Джокьякарта",
    # Корея
    "Сеул", "Пусан", "Чеджу",
    # Сингапур
    "Сингапур",
    # Малайзия
    "Куала-Лумпур", "Пенанг",
    # Турция
    "Стамбул", "Каппадокия", "Анталья",
]

# Страны
COUNTRIES = [
    "Таиланд", "ОАЭ", "Япония", "Китай", "Индия", 
    "Вьетнам", "Индонезия", "Южная Корея", "Сингапур", 
    "Малайзия", "Турция"
]


@router.get("/sitemap.xml", response_class=Response)
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    """
    Динамическая генерация sitemap.xml со всеми турами, странами и городами
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Получаем все активные туры
    result = await db.execute(
        select(Tour.id, Tour.title, Tour.updated_at)
        .where(Tour.active == True)
        .order_by(Tour.id)
    )
    tours = result.fetchall()
    
    # Начинаем XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Главная страница
    xml_content += f'''  <url>
    <loc>{FRONTEND_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>{today}</lastmod>
  </url>\n'''
    
    # Каталог туров
    xml_content += f'''  <url>
    <loc>{FRONTEND_URL}/tours</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>{today}</lastmod>
  </url>\n'''
    
    # Страны
    for country in COUNTRIES:
        encoded_country = country.replace(" ", "%20")
        xml_content += f'''  <url>
    <loc>{FRONTEND_URL}/tours?location={encoded_country}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n'''
    
    # Города
    for city in POPULAR_CITIES:
        encoded_city = city.replace(" ", "%20")
        xml_content += f'''  <url>
    <loc>{FRONTEND_URL}/tours?location={encoded_city}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    
    # Все туры
    for tour in tours:
        tour_id, title, updated_at = tour
        lastmod = updated_at.strftime("%Y-%m-%d") if updated_at else today
        xml_content += f'''  <url>
    <loc>{FRONTEND_URL}/tours/{tour_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>{lastmod}</lastmod>
  </url>\n'''
    
    # Информационные страницы
    info_pages = [
        ("/about", "monthly", "0.6"),
        ("/contact", "monthly", "0.6"),
        ("/faq", "monthly", "0.6"),
        ("/journal", "weekly", "0.7"),
        ("/request", "monthly", "0.7"),
        ("/become-guide", "monthly", "0.5"),
        ("/terms", "yearly", "0.3"),
        ("/privacy", "yearly", "0.3"),
    ]
    
    for path, changefreq, priority in info_pages:
        xml_content += f'''  <url>
    <loc>{FRONTEND_URL}{path}</loc>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>\n'''
    
    xml_content += '</urlset>'
    
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600"  # Кэш на 1 час
        }
    )


@router.get("/robots.txt", response_class=Response)
async def get_robots():
    """
    Динамическая генерация robots.txt
    """
    robots_content = """# Inturex - Экскурсии по Азии
# https://thaiguide-frontend-production.up.railway.app/

User-agent: *
Allow: /

# Закрытые разделы
Disallow: /dashboard/
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /api/

# Sitemap
Sitemap: https://thaiguide-frontend-production.up.railway.app/api/v1/seo/sitemap.xml

# Crawl-delay для вежливости
Crawl-delay: 1

# Yandex
User-agent: Yandex
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /login
Disallow: /register
Host: https://thaiguide-frontend-production.up.railway.app
"""
    
    return Response(
        content=robots_content,
        media_type="text/plain",
        headers={"Content-Type": "text/plain; charset=utf-8"}
    )

