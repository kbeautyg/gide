"""
API эндпоинты для статей журнала
"""
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func, delete
from typing import Optional
from datetime import datetime
import re

from app.db.session import get_db
from app.models.article import Article
from app.schemas.article import Article as ArticleSchema, ArticleCreate, ArticleList

router = APIRouter()


def generate_slug(title: str) -> str:
    """Генерирует URL-friendly slug из заголовка"""
    # Транслитерация кириллицы
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    }
    
    result = ''
    for char in title.lower():
        if char in translit_map:
            result += translit_map[char]
        elif char.isalnum():
            result += char
        elif char in ' -_':
            result += '-'
    
    # Убираем двойные дефисы и дефисы по краям
    result = re.sub(r'-+', '-', result)
    result = result.strip('-')
    
    return result[:100]  # Ограничиваем длину


@router.get("/", response_model=ArticleList)
async def get_articles(
    country_tag: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(default=20, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Получить список статей"""
    query = select(Article)
    
    if country_tag:
        query = query.where(Article.country_tag == country_tag)
    
    query = query.order_by(desc(Article.published_at))
    
    # Получаем общее количество
    count_query = select(func.count(Article.id))
    if country_tag:
        count_query = count_query.where(Article.country_tag == country_tag)
    
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0
    
    # Получаем статьи
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    articles = result.scalars().all()
    
    return {"articles": articles, "total": total}


@router.get("/{slug}", response_model=ArticleSchema)
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    """Получить статью по slug"""
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    
    # Увеличиваем счётчик просмотров
    article.views_count = (article.views_count or 0) + 1
    await db.commit()
    
    return article


@router.post("/", response_model=ArticleSchema)
async def create_article(
    article_data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Создать новую статью (требует авторизации)"""
    # Проверяем авторизацию (простая проверка токена)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    # Генерируем slug если не указан
    slug = article_data.slug if article_data.slug else generate_slug(article_data.title)
    
    # Проверяем уникальность slug
    result = await db.execute(select(Article).where(Article.slug == slug))
    existing = result.scalar_one_or_none()
    
    if existing:
        # Добавляем timestamp для уникальности
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
    # Создаём статью
    article = Article(
        title=article_data.title,
        slug=slug,
        preview_text=article_data.preview_text,
        content=article_data.content,
        photo_url=article_data.photo_url,
        read_time=article_data.read_time or 5,
        country_tag=article_data.country_tag,
        views_count=0,
        published_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(article)
    await db.commit()
    await db.refresh(article)
    
    return article


@router.delete("/{article_id}")
async def delete_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Удалить статью"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    
    await db.delete(article)
    await db.commit()
    
    return {"success": True, "message": f"Статья {article_id} удалена"}


@router.delete("/")
async def delete_all_articles(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Удалить ВСЕ статьи"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    
    # Получаем количество
    count_result = await db.execute(select(func.count(Article.id)))
    count = count_result.scalar() or 0
    
    # Удаляем все
    await db.execute(delete(Article))
    await db.commit()
    
    return {"success": True, "message": f"Удалено {count} статей", "deleted": count}
