-- ============================================================
-- СОЗДАНИЕ ТАБЛИЦ ДЛЯ КАТЕГОРИЙ И КОЛЛЕКЦИЙ
-- Выполните этот код в SQL Editor на Supabase
-- ============================================================

-- 1. Создаем таблицу categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    slug VARCHAR NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR NOT NULL,
    icon VARCHAR,
    image_url VARCHAR,
    filters JSONB DEFAULT '{}',
    extra_data JSONB DEFAULT '{}',
    seo_title VARCHAR,
    seo_description TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индексы для categories
CREATE INDEX IF NOT EXISTS ix_categories_id ON categories(id);
CREATE INDEX IF NOT EXISTS ix_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS ix_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS ix_categories_type ON categories(type);

-- 2. Создаем таблицу collections
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    description TEXT,
    cover_image VARCHAR,
    tour_ids JSONB DEFAULT '[]',
    is_automatic BOOLEAN DEFAULT FALSE,
    auto_filters JSONB DEFAULT '{}',
    auto_limit INTEGER,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR,
    seo_description TEXT,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индексы для collections
CREATE INDEX IF NOT EXISTS ix_collections_id ON collections(id);
CREATE INDEX IF NOT EXISTS ix_collections_slug ON collections(slug);

-- 3. Вставляем базовые категории - ДОСТОПРИМЕЧАТЕЛЬНОСТИ
INSERT INTO categories (name, slug, type, icon, is_featured, display_order, is_active, filters, extra_data)
VALUES 
    ('Храмы и святыни', 'temples-shrines', 'landmark', '🏛️', TRUE, 1, TRUE, '{}', '{}'),
    ('Дворцы и крепости', 'palaces-fortresses', 'landmark', '🏰', TRUE, 2, TRUE, '{}', '{}'),
    ('Пляжи и острова', 'beaches-islands', 'landmark', '🏖️', TRUE, 3, TRUE, '{}', '{}'),
    ('Горы и водопады', 'mountains-waterfalls', 'landmark', '⛰️', FALSE, 4, TRUE, '{}', '{}'),
    ('Рынки и базары', 'markets-bazaars', 'landmark', '🛒', FALSE, 5, TRUE, '{}', '{}'),
    ('Музеи и галереи', 'museums-galleries', 'landmark', '🎨', FALSE, 6, TRUE, '{}', '{}')
ON CONFLICT (slug) DO NOTHING;

-- 4. Вставляем базовые категории - ТЕМЫ
INSERT INTO categories (name, slug, type, icon, is_featured, display_order, is_active, filters, extra_data)
VALUES 
    ('Культура и история', 'culture-history', 'theme', '📚', TRUE, 1, TRUE, '{}', '{}'),
    ('Гастрономия', 'gastronomy', 'theme', '🍜', TRUE, 2, TRUE, '{}', '{}'),
    ('Природа и пейзажи', 'nature-landscapes', 'theme', '🌿', TRUE, 3, TRUE, '{}', '{}'),
    ('Приключения', 'adventures', 'theme', '🎿', FALSE, 4, TRUE, '{}', '{}'),
    ('Ночная жизнь', 'nightlife', 'theme', '🌙', FALSE, 5, TRUE, '{}', '{}'),
    ('Шопинг', 'shopping', 'theme', '🛍️', FALSE, 6, TRUE, '{}', '{}')
ON CONFLICT (slug) DO NOTHING;

-- 5. Вставляем базовые категории - ФОРМАТЫ
INSERT INTO categories (name, slug, type, icon, is_featured, display_order, is_active, filters, extra_data)
VALUES 
    ('Индивидуальные', 'private-tours', 'format', '👤', TRUE, 1, TRUE, '{}', '{}'),
    ('Групповые', 'group-tours', 'format', '👥', TRUE, 2, TRUE, '{}', '{}'),
    ('Пешеходные', 'walking-tours', 'format', '🚶', FALSE, 3, TRUE, '{}', '{}'),
    ('На транспорте', 'vehicle-tours', 'format', '🚗', FALSE, 4, TRUE, '{}', '{}'),
    ('Водные', 'water-tours', 'format', '⛵', FALSE, 5, TRUE, '{}', '{}')
ON CONFLICT (slug) DO NOTHING;

-- 6. Вставляем базовые КОЛЛЕКЦИИ
INSERT INTO collections (title, slug, description, is_automatic, auto_filters, auto_limit, is_featured, display_order, is_active, tour_ids)
VALUES 
    ('Лучшие водные экскурсии', 'best-water-tours', 'Острова, пляжи, дайвинг и морские приключения', 
     TRUE, '{"tags": ["Водные"], "min_rating": 4.7}'::jsonb, 12, TRUE, 1, TRUE, '[]'::jsonb),
    ('Культурное наследие Азии', 'cultural-heritage', 'Храмы, дворцы и исторические памятники', 
     TRUE, '{"category": "Культура", "min_rating": 4.5}'::jsonb, 15, TRUE, 2, TRUE, '[]'::jsonb),
    ('Гастрономические туры', 'food-tours', 'Уличная еда, рынки и кулинарные мастер-классы', 
     TRUE, '{"category": "Гастрономия", "min_rating": 4.6}'::jsonb, 10, TRUE, 3, TRUE, '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- 7. Обновляем запись в alembic_version для миграции 012
INSERT INTO alembic_version (version_num) 
VALUES ('012_add_categories')
ON CONFLICT (version_num) DO NOTHING;

-- ============================================================
-- ГОТОВО! Таблицы созданы и заполнены базовыми данными
-- ============================================================

-- Проверка созданных категорий:
SELECT type, COUNT(*) as count FROM categories GROUP BY type;

-- Проверка созданных коллекций:
SELECT COUNT(*) as count FROM collections;

