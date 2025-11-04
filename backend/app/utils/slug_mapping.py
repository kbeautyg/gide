"""
Утилиты для работы со slug (URL-friendly строки) в backend
Маппинг slug -> название для стран и городов
"""

# Маппинг городов: slug -> название
CITY_SLUG_MAP: dict[str, str] = {
    'bangkok': 'Бангкок',
    'phuket': 'Пхукет',
    'pattaya': 'Паттайя',
    'krabi': 'Краби',
    'chiangmai': 'Чиангмай',
    'ko-tao': 'Ко Тао',
    'ko-samui': 'Ко Самуи',
    'hua-hin': 'Хуа Хин',
    'dubai': 'Дубай',
    'abu-dhabi': 'Абу-Даби',
    'sharjah': 'Шарджа',
    'ajman': 'Аджман',
    'tokyo': 'Токио',
    'kyoto': 'Киото',
    'osaka': 'Осака',
    'hiroshima': 'Хиросима',
    'nara': 'Нара',
    'fukuoka': 'Фукуока',
    'sapporo': 'Саппоро',
    'seoul': 'Сеул',
    'busan': 'Пусан',
    'jeju': 'Чеджу',
    'incheon': 'Инчхон',
    'ubud': 'Убуд',
    'seminyak': 'Семиньяк',
    'nusa-dua': 'Нуса-Дуа',
    'jakarta': 'Джакарта',
    'yogyakarta': 'Джокьякарта',
    'lombok': 'Ломбок',
    'hanoi': 'Ханой',
    'ho-chi-minh': 'Хошимин',
    'halong': 'Халонг',
    'nha-trang': 'Нячанг',
    'dalat': 'Далат',
    'hoi-an': 'Хойан',
    'hue': 'Хюэ',
    'singapore': 'Сингапур',
    'beijing': 'Пекин',
    'shanghai': 'Шанхай',
    'xian': 'Сиань',
    'guangzhou': 'Гуанчжоу',
    'chengdu': 'Ченду',
    'hong-kong': 'Гонконг',
    'delhi': 'Дели',
    'mumbai': 'Мумбаи',
    'jaipur': 'Джайпур',
    'agra': 'Агра',
    'goa': 'Гоа',
    'varanasi': 'Варанаси',
    'udaipur': 'Удайпур',
    'kuala-lumpur': 'Куала-Лумпур',
    'penang': 'Пенанг',
    'langkawi': 'Лангкави',
    'malacca': 'Малакка',
}

# Маппинг стран: slug -> название
COUNTRY_SLUG_MAP: dict[str, str] = {
    'thailand': 'Таиланд',
    'uae': 'ОАЭ',
    'japan': 'Япония',
    'south-korea': 'Корея',
    'indonesia': 'Индонезия',
    'vietnam': 'Вьетнам',
    'singapore': 'Сингапур',
    'china': 'Китай',
    'india': 'Индия',
    'malaysia': 'Малайзия',
}

# Обратный маппинг: название -> slug
CITY_NAME_TO_SLUG: dict[str, str] = {v: k for k, v in CITY_SLUG_MAP.items()}
COUNTRY_NAME_TO_SLUG: dict[str, str] = {v: k for k, v in COUNTRY_SLUG_MAP.items()}


def get_city_name_from_slug(slug: str) -> str | None:
    """Получить название города по slug"""
    return CITY_SLUG_MAP.get(slug)


def get_country_name_from_slug(slug: str) -> str | None:
    """Получить название страны по slug"""
    return COUNTRY_SLUG_MAP.get(slug)


def get_city_slug_from_name(name: str) -> str | None:
    """Получить slug города по названию"""
    return CITY_NAME_TO_SLUG.get(name)


def get_country_slug_from_name(name: str) -> str | None:
    """Получить slug страны по названию"""
    return COUNTRY_NAME_TO_SLUG.get(name)

