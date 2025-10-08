"""
API эндпоинты для статей журнала
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.core.deps import get_db
from app.models.article import Article
from app.schemas.article import Article as ArticleSchema, ArticleCreate, ArticleList

router = APIRouter()


@router.get("/", response_model=ArticleList)
def get_articles(
    country_tag: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Получить список статей"""
    query = db.query(Article)
    
    if country_tag:
        query = query.filter(Article.country_tag == country_tag)
    
    query = query.order_by(desc(Article.published_at))
    
    total = query.count()
    articles = query.offset(skip).limit(limit).all()
    
    return {"articles": articles, "total": total}


@router.get("/{slug}", response_model=ArticleSchema)
def get_article(slug: str, db: Session = Depends(get_db)):
    """Получить статью по slug"""
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    
    # Увеличиваем счётчик просмотров
    article.views_count += 1
    db.commit()
    
    return article

