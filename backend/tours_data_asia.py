"""
Данные азиатских туров для seed_data.py
105 туров по странам Азии с полным наполнением
"""

def get_tours_data():
    """Возвращает список из 105+ азиатских туров"""
    return [
        # === БАНГКОК, ТАИЛАНД (20 туров) ===
        {
            "title": "Три главных храма Бангкока за один день",
            "description": "Посетите величественные храмы Ват Пхо с лежащим Буддой (46 метров!), Ват Арун с керамической мозаикой и Храм Изумрудного Будды в Большом дворце. Узнаете о буддизме, тайской архитектуре и королевской истории.",
            "price": 3500, "duration": 6, "location": "Бангкок, Таиланд", "category": "Культура",
            "rating": 4.9, "reviews_count": 287,
            "photos": [
                "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
                "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
                "https://images.unsplash.com/photo-1599038966398-3fe4dd76fdc8?w=800",
                "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
                "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"
            ]
        },
        {
            "title": "Уличная еда Бангкока: от пад тая до манго с рисом",
            "description": "Гастрономическое путешествие по 7 лучшим уличным локациям. Попробуете 12+ блюд: пад тай, том ям, сом там, манго стики райс, роти и напитки. Узнаете рецепты и секреты тайской кухни от шефов.",
            "price": 4200, "duration": 4, "location": "Бангкок, Таиланд", "category": "Гастрономия",
            "rating": 5.0, "reviews_count": 412,
            "photos": [
                "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800",
                "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
                "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800",
                "https://images.unsplash.com/photo-1584030373081-f809da56c00e?w=800",
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
            ]
        },
        {
            "title": "Ночная жизнь Бангкока: бары на крышах и клубы",
            "description": "Лучшие rooftop бары с видом на город, танцы до утра в топовых клубах, ночной рынок Асиатик. Коктейли, еда, атмосфера — всё включено.",
            "price": 5500, "duration": 5, "location": "Бангкок, Таиланд", "category": "Развлечения",
            "rating": 4.7, "reviews_count": 234,
            "photos": [
                "https://images.unsplash.com/photo-1526882924447-7e9da5da8d84?w=800",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"
            ]
        },
        {
            "title": "Плавучие рынки и каналы Бангкока",
            "description": "Поездка на традиционной лодке по каналам-клонгам, посещение плавучего рынка Дамноен Садуак, дегустация фруктов и уличной еды с лодок.",
            "price": 3800, "duration": 5, "location": "Бангкок, Таиланд", "category": "Культура",
            "rating": 4.8, "reviews_count": 298,
            "photos": [
                "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
                "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800"
            ]
        },
        {
            "title": "Тайский массаж и SPA в королевском стиле",
            "description": "3 часа релакса: традиционный тайский массаж, ароматерапия, джакузи с лепестками роз, травяные компрессы. В конце — смузи и фрукты.",
            "price": 6500, "duration": 3, "location": "Бангкок, Таиланд", "category": "SPA",
            "rating": 4.9, "reviews_count": 189,
            "photos": [
                "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
            ]
        },
        {
            "title": "Чайнатаун Бангкока: золото, еда и история",
            "description": "Прогулка по китайскому кварталу Яоварат, посещение золотых магазинов, дегустация димсамов, уличная еда, храм Wat Traimit с золотым Буддой.",
            "price": 3200, "duration": 4, "location": "Бангкок, Таиланд", "category": "Культура",
            "rating": 4.6, "reviews_count": 176,
            "photos": [
                "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800",
                "https://images.unsplash.com/photo-1505245208761-ba872912fac0?w=800"
            ]
        },
        {
            "title": "Круиз по реке Чао-Прайя с ужином",
            "description": "Романтический ужин на борту традиционного корабля, проплываем мимо подсвеченных храмов Ват Арун и Ват Пхо, живая музыка, тайский буфет.",
            "price": 7800, "duration": 3, "location": "Бангкок, Таиланд", "category": "VIP",
            "rating": 5.0, "reviews_count": 312,
            "photos": [
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
            ]
        },
        {
            "title": "Аюттхая: древняя столица Сиама",
            "description": "Однодневная поездка в исторический парк Аюттхая (UNESCO). Развалины храмов, голова Будды в корнях дерева, катание на слонах, обед в местном ресторане.",
            "price": 5500, "duration": 8, "location": "Бангкок, Таиланд", "category": "История",
            "rating": 4.8, "reviews_count": 267,
            "photos": [
                "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
                "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
            ]
        },
        {
            "title": "Рынок Чатучак: шопинг и торговля",
            "description": "Крупнейший рынок Азии (15 000 лавок!). Одежда, сувениры, антиквариат, уличная еда. Научу торговаться и покажу лучшие секции.",
            "price": 2800, "duration": 4, "location": "Бангкок, Таиланд", "category": "Шопинг",
            "rating": 4.5, "reviews_count": 198,
            "photos": [
                "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"
            ]
        },
        {
            "title": "Инстаграмные места Бангкока",
            "description": "Фотосессия в самых красивых локациях: Mahanakhon SkyWalk, Pak Klong Talad (цветочный рынок), кафе с неоновыми вывесками, стрит-арт.",
            "price": 4500, "duration": 4, "location": "Бангкок, Таиланд", "category": "Фотосессии",
            "rating": 4.9, "reviews_count": 156,
            "photos": [
                "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
            ]
        },
        
        # Продолжение - оставшиеся 10 туров по Бангкоку...
        {
            "title": "Мастер-класс по тайской кухне",
            "description": "Готовим 5 традиционных блюд: пад тай, том ям, карри, спринг-роллы, манго стики райс. Посещение рынка, все ингредиенты, рецепты домой.",
            "price": 3900, "duration": 4, "location": "Бангкок, Таиланд", "category": "Гастрономия",
            "rating": 5.0, "reviews_count": 223,
            "photos": ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"]
        },
        {
            "title": "Бангкок с высоты: Байок Скай и Mahanakhon",
            "description": "Подъём на две самые высокие смотровые площадки города. Закат с 360° панорамой, коктейли в Sky Bar, ужин с видом на ночной город.",
            "price": 6800, "duration": 4, "location": "Бангкок, Таиланд", "category": "Развлечения",
            "rating": 4.8, "reviews_count": 267,
            "photos": ["https://images.unsplash.com/photo-1526882924447-7e9da5da8d84?w=800"]
        },
        {
            "title": "Зоопарк Дусит и прогулка по каналам",
            "description": "Животные, кормление жирафов, лодка по Чао-Прайя с посещением храмов на берегах. Подходит для семей с детьми.",
            "price": 3500, "duration": 5, "location": "Бангкок, Таиланд", "category": "Семейные",
            "rating": 4.7, "reviews_count": 142,
            "photos": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"]
        },
        {
            "title": "Бангкок для любителей архитектуры",
            "description": "Архитектурный микс: старинные деревянные дома, колониальные здания, современные небоскребы MahaNakhon, дворцы в тайском стиле.",
            "price": 4200, "duration": 5, "location": "Бангкок, Таиланд", "category": "Архитектура",
            "rating": 4.7, "reviews_count": 134,
            "photos": ["https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800"]
        },
        {
            "title": "Ночной рынок Rot Fai и винтажный шопинг",
            "description": "Уникальный рынок с винтажными вещами, антиквариатом, стариннымиPostersMotorcycles, уличная еда, живая музыка. Атмосфера ретро-Тайланда.",
            "price": 3200, "duration": 3, "location": "Бангкок, Таиланд", "category": "Шопинг",
            "rating": 4.6, "reviews_count": 178,
            "photos": ["https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"]
        },
        {
            "title": "Тайский бокс: тренировка и бой",
            "description": "Посещение тренировки муай-тай в легендарном зале, вечером — настоящий бой на стадионе Lumpinee или Rajadamnern с комментариями.",
            "price": 5500, "duration": 5, "location": "Бангкок, Таиланд", "category": "Спорт",
            "rating": 4.9, "reviews_count": 198,
            "photos": ["https://images.unsplash.com/photo-1517438322307-e67111335449?w=800"]
        },
        {
            "title": "Йога и медитация в храме на рассвете",
            "description": "Встреча рассвета в храме, йога-сессия с монахом, медитация, вегетарианский завтрак. Погружение в буддийскую практику.",
            "price": 2800, "duration": 3, "location": "Бангкок, Таиланд", "category": "Здоровье",
            "rating": 5.0, "reviews_count": 167,
            "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]
        },
        {
            "title": "Ночной Бангкок на мотобайке",
            "description": "Экстремальная поездка на заднем сиденье мотобайка по ночному городу. Проедем районы, куда не ходят туристы. Только для смелых!",
            "price": 4500, "duration": 3, "location": "Бангкок, Таиланд", "category": "Приключения",
            "rating": 4.8, "reviews_count": 142,
            "photos": ["https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"]
        },
        {
            "title": "Шопинг-тур по торговым центрам",
            "description": "Siam Paragon, Central World, MBK — всё за один день. Личный шопинг-ассистент, скидки, такс-фри оформление.",
            "price": 3800, "duration": 6, "location": "Бангкок, Таиланд", "category": "Шопинг",
            "rating": 4.6, "reviews_count": 189,
            "photos": ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]
        },
        {
            "title": "Бангкок глазами местного жителя",
            "description": "Увидите город изнутри: где едят тайцы, какие храмы посещают, скрытые кафе и арт-пространства. Аутентичный опыт без туристических ловушек.",
            "price": 3500, "duration": 5, "location": "Бангкок, Таиланд", "category": "Необычные",
            "rating": 4.9, "reviews_count": 234,
            "photos": ["https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800"]
        },
        
        # === ПХУКЕТ, ТАИЛАНД (15 туров) ===
        {
            "title": "Острова Пхи-Пхи на закате: бухта Майя Бэй",
            "description": "Снорклинг в кристальных водах, посещение знаменитой бухты Майя Бэй из фильма 'Пляж', обезьянки, романтический ужин на пляже на закате.",
            "price": 12000, "duration": 8, "location": "Пхукет, Таиланд", "category": "Природа",
            "rating": 4.9, "reviews_count": 456,
            "photos": [
                "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
                "https://images.unsplash.com/photo-1589224251458-b82c64024e03?w=800",
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
            ]
        },
        {
            "title": "Сёрфинг на Пхукете: урок для начинающих",
            "description": "2 часа на волнах с профессиональным инструктором, доска и оборудование включено. Пляж Ката — лучшее место для обучения.",
            "price": 4500, "duration": 2, "location": "Пхукет, Таиланд", "category": "Спорт",
            "rating": 4.7, "reviews_count": 198,
            "photos": ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"]
        },
        {
            "title": "Большой Будда и смотровая площадка",
            "description": "Подъём к 45-метровой статуе Большого Будды на вершине холма, панорамный вид на остров, посещение храма, закат.",
            "price": 2800, "duration": 3, "location": "Пхукет, Таиланд", "category": "Культура",
            "rating": 4.8, "reviews_count": 267,
            "photos": ["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"]
        },
        {
            "title": "Ночной рынок и шопинг на Патонге",
            "description": "Bangla Road — сердце ночной жизни Пхукета. Бары, шоу, ночной рынок Malin Plaza, торговля, сувениры.",
            "price": 3500, "duration": 4, "location": "Пхукет, Таиланд", "category": "Развлечения",
            "rating": 4.5, "reviews_count": 234,
            "photos": ["https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"]
        },
        {
            "title": "Симиланские острова: дайвинг и снорклинг",
            "description": "Однодневная поездка на Симиланы (лучший снорклинг в Тайланде!). Черепахи, скаты, коралловые рифы, белоснежный песок.",
            "price": 9500, "duration": 10, "location": "Пхукет, Таиланд", "category": "Природа",
            "rating": 5.0, "reviews_count": 389,
            "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]
        },
        {
            "title": "Йога на рассвете у океана",
            "description": "Занятие хатха-йоги на пляже Ката на восходе солнца, медитация под шум волн, смузи-боул после тренировки.",
            "price": 2800, "duration": 2, "location": "Пхукет, Таиланд", "category": "Здоровье",
            "rating": 4.9, "reviews_count": 156,
            "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]
        },
        {
            "title": "Морская рыбалка и барбекю на пляже",
            "description": "Утренняя рыбалка в Андаманском море, затем готовим улов на углях прямо на пляже. Пиво и закаты включены.",
            "price": 6500, "duration": 6, "location": "Пхукет, Таиланд", "category": "Приключения",
            "rating": 4.7, "reviews_count": 178,
            "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]
        },
        {
            "title": "Старый город Пхукета: португальское наследие",
            "description": "Прогулка по цветным домам sino-portuguese, винтажные кафе, галереи, стрит-арт. Инстаграмное место!",
            "price": 3200, "duration": 3, "location": "Пхукет, Таиланд", "category": "Культура",
            "rating": 4.6, "reviews_count": 145,
            "photos": ["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"]
        },
        {
            "title": "Катание на слонах и водопады",
            "description": "Этичный elephant sanctuary (без цирковых трюков), кормление, купание со слонами, затем поход к водопаду Bang Pae.",
            "price": 5500, "duration": 5, "location": "Пхукет, Таиланд", "category": "Природа",
            "rating": 4.8, "reviews_count": 234,
            "photos": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"]
        },
        {
            "title": "Закат на яхте с шампанским",
            "description": "Частная яхта, 3 часа в море, шампанское, фрукты, закуски, купание в открытом море, встреча заката.",
            "price": 18000, "duration": 3, "location": "Пхукет, Таиланд", "category": "VIP",
            "rating": 5.0, "reviews_count": 289,
            "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]
        },
        {
            "title": "Пляжный массаж и SPA-день",
            "description": "Целый день релакса: массаж на пляже, SPA-процедуры, джакузи с видом на океан, обед в beach club.",
            "price": 7800, "duration": 6, "location": "Пхукет, Таиланд", "category": "SPA",
            "rating": 4.9, "reviews_count": 267,
            "photos": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]
        },
        {
            "title": "Ночное шоу Phuket Fantasea",
            "description": "Грандиозное театрализованное шоу с слонами, акробатами, спецэффектами. Тайская культура и мифология. Буфет-ужин.",
            "price": 4500, "duration": 4, "location": "Пхукет, Таиланд", "category": "Развлечения",
            "rating": 4.7, "reviews_count": 312,
            "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]
        },
        {
            "title": "Каякинг в заливе Phang Nga",
            "description": "Гребля на каяках между известняковыми скалами, пещеры, мангровые леса, James Bond Island. Обед на плавучей деревне.",
            "price": 5800, "duration": 7, "location": "Пхукет, Таиланд", "category": "Приключения",
            "rating": 4.9, "reviews_count": 234,
            "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]
        },
        {
            "title": "Тайская кулинария: от рынка до тарелки",
            "description": "Посещение местного рынка, покупка ингредиентов, мастер-класс по приготовлению 4 блюд, обед из того что приготовили.",
            "price": 3900, "duration": 4, "location": "Пхукет, Таиланд", "category": "Гастрономия",
            "rating": 5.0, "reviews_count": 198,
            "photos": ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"]
        },
        {
            "title": "Морская прогулка на лонгтейле",
            "description": "Traditional longtail boat, посещение 3 секретных пляжей, снорклинг, рыбалка, барбекю на необитаемом острове.",
            "price": 6800, "duration": 6, "location": "Пхукет, Таиланд", "category": "Природа",
            "rating": 4.8, "reviews_count": 223,
            "photos": ["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800"]
        },
        
        # Из-за ограничений размера, добавлю остальные страны более компактно...
        # Ещё 70 туров по: Паттайя (5), Краби (3), Чиангмай (2), Ко Тао (тогда Токио (12), Киото (5), Осака (3),
        # Убуд (5), Семиньяк (4), Нуса-Дуа (3), Ханой (4), Хошимин (3), Халонг (3),
        # Сеул (6), Пусан (2), Сингапур (5), Дубай (5)
        
        # === ПАТТАЙЯ, ТАИЛАНД (5 туров) ===
        {"title": "Океанариум и шоу дельфинов", "description": "Интерактивная программа для детей, фото с дельфинами, огромный океанариум с тоннелем", "price": 4800, "duration": 4, "location": "Паттайя, Таиланд", "category": "Семейные", "rating": 4.8, "reviews_count": 267, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Рыбный рынок и сашими: выбираем и готовим", "description": "Покупаем свежайшие морепродукты на рынке, готовим с шефом, учимся делать сашими и роллы", "price": 5200, "duration": 3, "location": "Паттайя, Таиланд", "category": "Гастрономия", "rating": 4.7, "reviews_count": 189, "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]},
        {"title": "Walking Street: ночная Паттайя", "description": "Самая известная улица ночной жизни, бары, шоу, клубы, дискотеки до утра", "price": 3500, "duration": 5, "location": "Паттайя, Таиланд", "category": "Развлечения", "rating": 4.5, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"]},
        {"title": "Коралловый остров: снорклинг и парасейлинг", "description": "Поездка на Koh Larn, снорклинг, водные виды спорта, парасейлинг, обед на пляже", "price": 6500, "duration": 7, "location": "Паттайя, Таиланд", "category": "Приключения", "rating": 4.8, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Тропический сад Nong Nooch", "description": "Огромный ботанический сад, шоу слонов, традиционные тайские танцы, орхидеи", "price": 3800, "duration": 5, "location": "Паттайя, Таиланд", "category": "Природа", "rating": 4.7, "reviews_count": 156, "photos": ["https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800"]},
        
        # === КРАБИ, ТАИЛАНД (3 тура) ===
        {"title": "Трекинг к водопадам и горячим источникам", "description": "Поход по джунглям, купание в горячих источниках, водопады, обед-пикник", "price": 6800, "duration": 7, "location": "Краби, Таиланд", "category": "Природа", "rating": 4.9, "reviews_count": 178, "photos": ["https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800"]},
        {"title": "4 острова на лонгтейле", "description": "Poda Island, Chicken Island, Tup Island, Phra Nang Cave Beach. Снорклинг, пещеры, обед", "price": 5500, "duration": 7, "location": "Краби, Таиланд", "category": "Природа", "rating": 4.8, "reviews_count": 245, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Скалолазание на известняковых скалах", "description": "Railay Beach — мекка скалолазов. Урок для начинающих, оборудование, невероятные виды сверху", "price": 7200, "duration": 5, "location": "Краби, Таиланд", "category": "Экстрим", "rating": 4.9, "reviews_count": 134, "photos": ["https://images.unsplash.com/photo-1522398371702-4a2f2a9f5a70?w=800"]},
        
        # === ЧИАНГМАЙ, ТАИЛАНД (2 тура) ===
        {"title": "Doi Suthep и смотровая на город", "description": "Храм на горе с 309 ступенями, золотая ступа, панорамный вид на Чиангмай, монахи и колокола", "price": 3500, "duration": 4, "location": "Чиангмай, Таиланд", "category": "Культура", "rating": 4.8, "reviews_count": 223, "photos": ["https://images.unsplash.com/photo-1604577968897-fab6ff4a09a3?w=800"]},
        {"title": "Треккинг к племенам и водопадам", "description": "Поход в горы, посещение деревень племени Карен и Акха, водопады, бамбуковый рафтинг", "price": 8500, "duration": 10, "location": "Чиангмай, Таиланд", "category": "Приключения", "rating": 4.9, "reviews_count": 167, "photos": ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"]},
        
        # === КО ТАО, ТАИЛАНД (продолжение после других стран...)
        
        # === ТОКИО, ЯПОНИЯ (12 туров) ===
        {"title": "Токио за один день: от Сибуи до Асакусы", "description": "Перекрёсток Сибуя, храм Сэнсо-дзи, Мейдзи дзингу, район Харадзюку, Tokyo Tower", "price": 8500, "duration": 8, "location": "Токио, Япония", "category": "Обзорные", "rating": 4.9, "reviews_count": 412, "photos": ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800"]},
        {"title": "teamLab Borderless: цифровое искусство", "description": "Интерактивный музей с проекциями, бесконечные зеркальные комнаты, водопады света. Must-see!", "price": 6500, "duration": 3, "location": "Токио, Япония", "category": "Культура", "rating": 5.0, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1549144511-f099e773c147?w=800"]},
        {"title": "Рыбный рынок Цукидзи и суши-завтрак", "description": "Новый рынок Тоёсу, свежайшая рыба, дегустация суши от мастеров, тунец за $100к", "price": 7800, "duration": 4, "location": "Токио, Япония", "category": "Гастрономия", "rating": 4.9, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]},
        {"title": "Акихабара: мир аниме и манги", "description": "Район электроники и отаку-культуры, аниме-магазины, maid café, ретро-игры, гача-автоматы", "price": 5500, "duration": 4, "location": "Токио, Япония", "category": "Субкультуры", "rating": 4.8, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"]},
        {"title": "Музей Гибли и Mitaka", "description": "Студия Хаяо Миядзаки, эксклюзивные выставки, короткометражки, парк Inokashira", "price": 6800, "duration": 5, "location": "Токио, Япония", "category": "Культура", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1549144511-f099e773c147?w=800"]},
        {"title": "Ночной Токио: Синдзюку и Роппонги", "description": "Neon lights, Golden Gai (крохотные бары), karaoke, ночной вид с Mori Tower", "price": 7500, "duration": 5, "location": "Токио, Япония", "category": "Развлечения", "rating": 4.7, "reviews_count": 312, "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]},
        {"title": "Рамен-тур: 5 лучших заведений", "description": "Дегустация разных стилей рамена: сёю, мисо, тонкоцу, цукэмэн. От уличных лавок до ресторанов", "price": 6200, "duration": 4, "location": "Токио, Япония", "category": "Гастрономия", "rating": 4.9, "reviews_count": 378, "photos": ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800"]},
        {"title": "Храмы и сады: дзен-опыт", "description": "Мейдзи дзингу, Сэнсо-дзи, сад Хаппо-эн, чайная церемония, медитация в храме", "price": 7200, "duration": 6, "location": "Токио, Япония", "category": "Культура", "rating": 4.8, "reviews_count": 256, "photos": ["https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"]},
        {"title": "Харадзюку и Омотэсандо: мода и стиль", "description": "Стрит-фэшн, Takeshita Street, винтажные магазины, designer boutiques, crepe и bubble tea", "price": 5800, "duration": 4, "location": "Токио, Япония", "category": "Шопинг", "rating": 4.6, "reviews_count": 223, "photos": ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"]},
        {"title": "Дисней и DisneySea Токио", "description": "Tokyo DisneySea (только в Японии!), без очередей с Fast Pass, встреча с персонажами", "price": 12000, "duration": 10, "location": "Токио, Япония", "category": "Семейные", "rating": 5.0, "reviews_count": 678, "photos": ["https://images.unsplash.com/photo-1512206866737-0b4ff9acefc9?w=800"]},
        {"title": "Гора Фудзи и озеро Кавагучико", "description": "Однодневная поездка к священной горе, смотровая площадка, онсен с видом на Фудзи", "price": 9800, "duration": 10, "location": "Токио, Япония", "category": "Природа", "rating": 4.9, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800"]},
        {"title": "Мастер-класс по суши", "description": "Готовим нигири, маки, сашими с профессиональным сushi chef, все инструменты, дегустация", "price": 8500, "duration": 3, "location": "Токио, Япония", "category": "Гастрономия", "rating": 5.0, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800"]},
        
        # Остальные страны добавлю более компактно...
        # === КИОТО (5), ОСАКА (3), УБУД (5), СЕМИНЬЯК (4), НУСА-ДУА (3), ХАНОЙ (4), ХОШИМИН (3), ХАЛОНГ (3), СЕУЛ (6), ПУСАН (2), СИНГАПУР (5), ДУБАЙ (5) ===
        
        # КИОТО, ЯПОНИЯ (5 туров)
        {"title": "Золотой храм Кинкаку-дзи и сады дзен", "description": "Золотой павильон, сад камней Рёан-дзи, бамбуковый лес Арасияма, традиционный обед", "price": 7800, "duration": 7, "location": "Киото, Япония", "category": "Культура", "rating": 5.0, "reviews_count": 523, "photos": ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"]},
        {"title": "Гейши района Гион", "description": "Прогулка по историческому кварталу, шанс увидеть гейшу, традиционное чаепитие, объяснение культуры", "price": 6500, "duration": 3, "location": "Киото, Япония", "category": "Культура", "rating": 4.9, "reviews_count": 378, "photos": ["https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"]},
        {"title": "Храм 1000 статуй и Фусими Инари", "description": "Sanjusangendo с 1001 статуей Каннон, святилище Фусими Инари с 10000 красных ворот тории", "price": 5800, "duration": 5, "location": "Киото, Япония", "category": "Культура", "rating": 4.9, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"]},
        {"title": "Императорский дворец и сады", "description": "Киотский императорский дворец (бронь заранее!), сад Нидзё-дзё, соловьиные полы", "price": 6800, "duration": 4, "location": "Киото, Япония", "category": "История", "rating": 4.8, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"]},
        {"title": "Кайсэки: высокая кухня Киото", "description": "Ужин кайсэки (японская haute cuisine), 12 блюд, каждое — произведение искусства, сакэ-пэринг", "price": 15000, "duration": 3, "location": "Киото, Япония", "category": "Гастрономия", "rating": 5.0, "reviews_count": 289, "photos": ["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800"]},
        
        # ОСАКА, ЯПОНИЯ (3 тура)
        {"title": "Уличная еда Дотонбори", "description": "Такояки, окономияки, кусияки, рамен — пробуем всё! Neon lights, Canal City, фото с крабом Кани Дораку", "price": 5500, "duration": 4, "location": "Осака, Япония", "category": "Гастрономия", "rating": 4.9, "reviews_count": 467, "photos": ["https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=800"]},
        {"title": "Замок Осаки и исторический парк", "description": "Один из красивейших замков Японии, музей самураев, сад сакуры (весной), панорамный вид сверху", "price": 4800, "duration": 4, "location": "Осака, Япония", "category": "История", "rating": 4.8, "reviews_count": 334, "photos": ["https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=800"]},
        {"title": "Universal Studios Japan", "description": "Harry Potter World, Mario World, аттракционы, шоу. Fast Pass для всех аттракционов", "price": 11000, "duration": 10, "location": "Осака, Япония", "category": "Семейные", "rating": 4.9, "reviews_count": 789, "photos": ["https://images.unsplash.com/photo-1512206866737-0b4ff9acefc9?w=800"]},
        
        # УБУД, БАЛИ (5 туров)
        {"title": "Рисовые террасы Тегаллаланг", "description": "Знаменитые террасы (Instagram must!), качели в джунглях, кофейная плантация лювак, водопад Tegenungan", "price": 4500, "duration": 6, "location": "Убуд, Индонезия", "category": "Природа", "rating": 4.9, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        {"title": "Храм Танах Лот на закате", "description": "Храм на скале в океане, один из символов Бали, традиционный танец кечак на закате", "price": 3800, "duration": 4, "location": "Убуд, Индонезия", "category": "Культура", "rating": 4.8, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        {"title": "Лес обезьян и арт-рынок", "description": "Sacred Monkey Forest с 700 обезьян, кормление, храмы в джунглях, затем арт-рынок Убуда", "price": 3200, "duration": 4, "location": "Убуд, Индонезия", "category": "Природа", "rating": 4.7, "reviews_count": 398, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        {"title": "Балийский массаж и SPA-ритуал", "description": "4 часа: скраб, массаж, цветочная ванна, йога, травяной чай. Лучшие SPA острова", "price": 8500, "duration": 4, "location": "Убуд, Индонезия", "category": "SPA", "rating": 5.0, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]},
        {"title": "Водопады и вулкан Батур", "description": "Водопады Секумпул и Лемпуянг, смотровая на вулкан Батур, купание в озере, обед с видом", "price": 6800, "duration": 8, "location": "Убуд, Индонезия", "category": "Природа", "rating": 4.9, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800"]},
        
        # СЕМИНЬЯК, БАЛИ (4 тура)
        {"title": "Сёрфинг и пляжные клубы", "description": "Урок серфинга утром, затем релакс в beach club (Potato Head или Finns), коктейли, инфинити-пул", "price": 7500, "duration": 6, "location": "Семиньяк, Индонезия", "category": "Спорт", "rating": 4.8, "reviews_count": 345, "photos": ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"]},
        {"title": "Закат на пляже Семиньяк", "description": "Романтический ужин на пляже, свечи, живая музыка, морепродукты на гриле, коктейли", "price": 9500, "duration": 3, "location": "Семиньяк, Индонезия", "category": "VIP", "rating": 5.0, "reviews_count": 423, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Шопинг-тур по бутикам", "description": "Лучшие дизайнерские магазины Seminyak Square, винтажные лавки, ювелирные мастерские, арт-галереи", "price": 3800, "duration": 4, "location": "Семиньяк, Индонезия", "category": "Шопинг", "rating": 4.6, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]},
        {"title": "Йога и детокс-программа", "description": "Утренняя йога, смузи-боул, массаж, вегетарианский обед, медитация на закате", "price": 5500, "duration": 6, "location": "Семиньяк, Индонезия", "category": "Здоровье", "rating": 4.9, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]},
        
        # НУСА-ДУА, БАЛИ (3 тура)
        {"title": "Снорклинг и дайвинг у Нуса-Пенида", "description": "Поездка на соседний остров, снорклинг с мантами, дайвинг (опционально), Crystal Bay", "price": 8500, "duration": 8, "location": "Нуса-Дуа, Индонезия", "category": "Природа", "rating": 4.9, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Водные виды спорта: парасейлинг и jet ski", "description": "Полёт на парашюте за катером, jet ski, banana boat, fly board — всё включено", "price": 6500, "duration": 3, "location": "Нуса-Дуа, Индонезия", "category": "Приключения", "rating": 4.7, "reviews_count": 312, "photos": ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"]},
        {"title": "Романтический ужин в Jimbaran Bay", "description": "Столик на песке, свечи, морепродукты на гриле, живая музыка, закат над океаном", "price": 8800, "duration": 3, "location": "Нуса-Дуа, Индонезия", "category": "VIP", "rating": 5.0, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        
        # ХАНОЙ, ВЬЕТНАМ (4 тура)
        {"title": "Старый квартал и стрит-фуд", "description": "36 улиц старого Ханоя, каждая — своя специализация. Фо, бун-ча, яичный кофе, бань-ми", "price": 3500, "duration": 4, "location": "Ханой, Вьетнам", "category": "Гастрономия", "rating": 4.9, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        {"title": "Храм литературы и Мавзолей Хо Ши Мина", "description": "Первый университет Вьетнама, мавзолей основателя страны, пагода на одном столбе, озеро Возвращенного Меча", "price": 4200, "duration": 5, "location": "Ханой, Вьетнам", "category": "История", "rating": 4.7, "reviews_count": 334, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        {"title": "Круиз по Красной реке", "description": "Вечерний круиз, ужин на борту, виды на подсвеченные мосты и набережные", "price": 5500, "duration": 3, "location": "Ханой, Вьетнам", "category": "Развлечения", "rating": 4.8, "reviews_count": 267, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Театр кукол на воде", "description": "Традиционное вьетнамское искусство, куклы танцуют на воде, музыканты играют вживую, объяснение сюжетов", "price": 2800, "duration": 2, "location": "Ханой, Вьетнам", "category": "Культура", "rating": 4.6, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        
        # ХОШИМИН, ВЬЕТНАМ (3 тура)
        {"title": "Тоннели Кучи: история войны", "description": "Посещение подземных тоннелей времён войны, музей, стрельбище (опционально), традиционный обед", "price": 4500, "duration": 6, "location": "Хошимин, Вьетнам", "category": "История", "rating": 4.8, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        {"title": "Рынки и уличная еда Сайгона", "description": "Рынок Бен Тхань, уличные лотки, фо, бань-ми, весенние роллы, вьетнамский кофе со льдом", "price": 3200, "duration": 4, "location": "Хошимин, Вьетнам", "category": "Гастрономия", "rating": 4.7, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        {"title": "Круиз по дельте Меконга", "description": "Поездка на лодке по каналам, плавучие рынки, фруктовые сады, медовая ферма, кокосовые конфеты", "price": 5800, "duration": 8, "location": "Хошимин, Вьетнам", "category": "Природа", "rating": 4.9, "reviews_count": 378, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        
        # ХАЛОНГ, ВЬЕТНАМ (3 тура)
        {"title": "Круиз по бухте Халонг: 2 дня / 1 ночь", "description": "Роскошный круиз, каяки, пещеры, плавучая деревня, морепродукты, рассвет среди скал", "price": 12000, "duration": 30, "location": "Халонг, Вьетнам", "category": "Природа", "rating": 5.0, "reviews_count": 678, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Однодневный круиз с каякингом", "description": "Поездка на целый день, каяки между скал, пещера Sung Sot, плавучая деревня, обед на борту", "price": 7500, "duration": 8, "location": "Халонг, Вьетнам", "category": "Приключения", "rating": 4.8, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Гидросамолёт над бухтой Халонг", "description": "25-минутный полёт на seaplane, виды на 2000 островов с высоты птичьего полёта, видео и фото", "price": 18000, "duration": 2, "location": "Халонг, Вьетнам", "category": "Экстрим", "rating": 5.0, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1522398371702-4a2f2a9f5a70?w=800"]},
        
        # СЕУЛ, КОРЕЯ (6 туров)
        {"title": "Дворцы Сеула: Кёнбоккун и смена караула", "description": "Главный дворец династии Чосон, смена караула (как в Букингемском!), традиционная деревня Bukchon Hanok", "price": 5500, "duration": 5, "location": "Сеул, Корея", "category": "История", "rating": 4.9, "reviews_count": 523, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        {"title": "K-pop и Gangnam Style", "description": "Район Gangnam, K-pop магазины, SM Town, шопинг в Myeongdong, noraebang (караоке), жареная курица и соджу", "price": 6500, "duration": 6, "location": "Сеул, Корея", "category": "Субкультуры", "rating": 4.8, "reviews_count": 612, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        {"title": "Корейское барбекю и соджу-тур", "description": "3 лучших мясных ресторана, учимся жарить самги псаль, пьём соджу, banchan (закуски), kimchi", "price": 7200, "duration": 4, "location": "Сеул, Корея", "category": "Гастрономия", "rating": 5.0, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800"]},
        {"title": "DMZ: граница двух Корей", "description": "Поездка к демилитаризованной зоне, тоннели, обсерватория, Joint Security Area (по запросу), музей", "price": 8500, "duration": 8, "location": "Сеул, Корея", "category": "История", "rating": 4.9, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        {"title": "Рынки Сеула: от Namdaemun до Dongdaemun", "description": "Крупнейшие рынки города, одежда, электроника, еда, ночной шопинг (до 5 утра!), торговля", "price": 4200, "duration": 5, "location": "Сеул, Корея", "category": "Шопинг", "rating": 4.7, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"]},
        {"title": "N Seoul Tower и Namsan Park", "description": "Подъём на башню (236м), замки любви, панорама города, кафе, романтический ужин с видом", "price": 6800, "duration": 4, "location": "Сеул, Корея", "category": "Развлечения", "rating": 4.8, "reviews_count": 478, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        
        # ПУСАН, КОРЕЯ (2 тура)
        {"title": "Храм Хэдон Ёнгунса у моря", "description": "Уникальный храм на скалах у океана, восход солнца, статуя Будды, 108 ступеней, рыбный рынок Jagalchi", "price": 4500, "duration": 5, "location": "Пусан, Корея", "category": "Культура", "rating": 4.9, "reviews_count": 398, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        {"title": "Пляж Haeundae и морепродукты", "description": "Лучший пляж Кореи, купание, затем морепродукты на гриле в ресторане у моря, соджу и пиво", "price": 5200, "duration": 6, "location": "Пусан, Корея", "category": "Развлечения", "rating": 4.7, "reviews_count": 334, "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]},
        
        # СИНГАПУР (5 туров)
        {"title": "Gardens by the Bay и Marina Bay Sands", "description": "Футуристические сады, Supertree Grove (аватаровские деревья!), Cloud Forest, infinity pool (фото снаружи), шоу света и воды", "price": 6500, "duration": 5, "location": "Сингапур, Сингапур", "category": "Природа", "rating": 5.0, "reviews_count": 789, "photos": ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"]},
        {"title": "Чайнатаун, Маленькая Индия и Арабский квартал", "description": "Три культуры за один день, храмы, мечети, уличная еда, пряности, шопинг", "price": 4500, "duration": 6, "location": "Сингапур, Сингапур", "category": "Культура", "rating": 4.8, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"]},
        {"title": "Universal Studios Singapore", "description": "Transformers, Jurassic Park, Shrek 4D, аттракционы, шоу. Fast Pass на все rides", "price": 9500, "duration": 10, "location": "Сингапур, Сингапур", "category": "Семейные", "rating": 4.9, "reviews_count": 890, "photos": ["https://images.unsplash.com/photo-1512206866737-0b4ff9acefc9?w=800"]},
        {"title": "Ночное сафари в зоопарке", "description": "Уникальный ночной зоопарк, трамвай по джунглям, животные в естественной среде, шоу", "price": 7200, "duration": 4, "location": "Сингапур, Сингапур", "category": "Природа", "rating": 4.9, "reviews_count": 678, "photos": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"]},
        {"title": "Небоскрёбы и крыши Сингапура", "description": "1-Altitude bar (самый высокий!), CÉ LA VI, коктейли с видом на город, ужин в облаках", "price": 12000, "duration": 4, "location": "Сингапур, Сингапур", "category": "VIP", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1526882924447-7e9da5da8d84?w=800"]},
        
        # ДУБАЙ, ОАЭ (5 туров)
        {"title": "Бурдж Халифа: на вершине мира", "description": "Подъём на 124 и 148 этажи (555м!), панорама пустыни и города, фонтанное шоу внизу", "price": 8500, "duration": 3, "location": "Дубай, ОАЭ", "category": "Развлечения", "rating": 5.0, "reviews_count": 1023, "photos": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"]},
        {"title": "Сафари в пустыне: дюны, верблюды, ужин", "description": "Джип-тур по дюнам, катание на верблюдах, соколиная охота (фото), бедуинский лагерь, шоу, барбекю", "price": 9500, "duration": 6, "location": "Дубай, ОАЭ", "category": "Приключения", "rating": 4.9, "reviews_count": 789, "photos": ["https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800"]},
        {"title": "Шопинг-тур: Dubai Mall и Mall of Emirates", "description": "2 крупнейших молла, аквариум, крытый ski, золотой рынок, личный стилист, такс-фри", "price": 8500, "duration": 7, "location": "Дубай, ОАЭ", "category": "Шопинг", "rating": 4.7, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]},
        {"title": "Яхта и Пальма Джумейра", "description": "Частная яхта вокруг Пальмы, купание в открытом море, шампанское, фрукты, вид на Atlantis", "price": 22000, "duration": 4, "location": "Дубай, ОАЭ", "category": "VIP", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Аквапарк Wild Wadi", "description": "Целый день водных развлечений, экстремальные горки, ленивая река, волновой бассейн, обед включён", "price": 7200, "duration": 7, "location": "Дубай, ОАЭ", "category": "Семейные", "rating": 4.8, "reviews_count": 678, "photos": ["https://images.unsplash.com/photo-1561410234-e464d75695da?w=800"]},
        
        # КО ТАО, ТАИЛАНД (продолжение - ещё туры)
        {"title": "Дайвинг на Ко Тао: сертификат PADI", "description": "Обучение дайвингу, 4 погружения, теория и практика, сертификат Open Water Diver", "price": 11000, "duration": 16, "location": "Ко Тао, Таиланд", "category": "Спорт", "rating": 4.9, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"]},
        {"title": "Снорклинг-тур: черепахи и рифы", "description": "Посещение 3 лучших точек для снорклинга, встреча с морскими черепахами, обед на лодке", "price": 3800, "duration": 6, "location": "Ко Тао, Таиланд", "category": "Природа", "rating": 4.8, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Вечеринка на пляже Full Moon", "description": "Легендарная вечеринка под полной луной, диджеи, файер-шоу, коктейли, танцы до утра", "price": 4500, "duration": 8, "location": "Ко Тао, Таиланд", "category": "Развлечения", "rating": 4.7, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800"]},
        {"title": "Йога и фридайвинг", "description": "Утренняя йога на пляже, затем обучение фридайвингу, дыхательные техники, погружение без акваланга", "price": 6500, "duration": 6, "location": "Ко Тао, Таиланд", "category": "Здоровье", "rating": 4.9, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]},
        
        # Дополнительные туры для Бангкока (ещё 5)
        {"title": "Тук-тук тур по ночному Бангкоку", "description": "Поездка на тук-туке по подсвеченному городу, храмы ночью, ночной рынок, уличная еда", "price": 3500, "duration": 4, "location": "Бангкок, Таиланд", "category": "Развлечения", "rating": 4.7, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=800"]},
        {"title": "Боксёрские тренировки Muay Thai", "description": "Утренняя тренировка с профессиональным тренером, техника ударов, спарринг, растяжка", "price": 2800, "duration": 3, "location": "Бангкок, Таиланд", "category": "Спорт", "rating": 4.8, "reviews_count": 198, "photos": ["https://images.unsplash.com/photo-1517438322307-e67111335449?w=800"]},
        {"title": "Вертикальные фермы и инновации", "description": "Экскурсия по вертикальным фермам, технологии будущего, дегустация organic продуктов", "price": 4200, "duration": 3, "location": "Бангкок, Таиланд", "category": "Необычные", "rating": 4.6, "reviews_count": 134, "photos": ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800"]},
        {"title": "Спа-ритуал с травяными мешочками", "description": "4 часа релакса: скраб, травяные компрессы, масляный массаж, ванна с молоком", "price": 5800, "duration": 4, "location": "Бангкок, Таиланд", "category": "SPA", "rating": 4.9, "reviews_count": 267, "photos": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]},
        {"title": "Фотосессия в цветочных садах", "description": "Профессиональная фотосессия в Queen Sirikit Botanic Garden, 100+ обработанных фото", "price": 8500, "duration": 3, "location": "Бангкок, Таиланд", "category": "Фотосессии", "rating": 5.0, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800"]},
        
        # Дополнительные туры для Пхукета (ещё 5)
        {"title": "Рассвет на пляже и завтрак", "description": "Встреча рассвета на пляже Ката, йога, медитация, тропический завтрак в beach club", "price": 3200, "duration": 3, "location": "Пхукет, Таиланд", "category": "Здоровье", "rating": 4.8, "reviews_count": 189, "photos": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]},
        {"title": "Кокосовая ферма и тропические фрукты", "description": "Экскурсия на ферму, сбор кокосов, дегустация 20+ тропических фруктов, кокосовое масло и мыло", "price": 3500, "duration": 4, "location": "Пхукет, Таиланд", "category": "Природа", "rating": 4.6, "reviews_count": 178, "photos": ["https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800"]},
        {"title": "Кайтсёрфинг: урок для начинающих", "description": "2 часа обучения кайтсёрфингу, оборудование, инструктор, теория и практика", "price": 6500, "duration": 2, "location": "Пхукет, Таиланд", "category": "Спорт", "rating": 4.7, "reviews_count": 156, "photos": ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"]},
        {"title": "Романтический ужин на пляже", "description": "Столик на песке, свечи, морепродукты на гриле, живая музыка, закат, бутылка вина", "price": 9800, "duration": 3, "location": "Пхукет, Таиланд", "category": "VIP", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Подводная охота и приготовление улова", "description": "Фридайвинг с гарпуном, ловим рыбу, затем готовим на гриле, пиво на пляже", "price": 7800, "duration": 5, "location": "Пхукет, Таиланд", "category": "Приключения", "rating": 4.8, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800"]},
        
        # Дополнительные туры для Токио (ещё 5)
        {"title": "Покемон центр и Nintendo Store", "description": "Мекка для геймеров: Pokemon Center Mega Tokyo, Nintendo Store, ретро-игровые автоматы", "price": 5200, "duration": 4, "location": "Токио, Япония", "category": "Субкультуры", "rating": 4.7, "reviews_count": 378, "photos": ["https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800"]},
        {"title": "Робот-кафе и технологии будущего", "description": "Robot Restaurant (шоу!), TeamLab, Sony ExploraScience, гаджеты в Akihabara", "price": 7800, "duration": 5, "location": "Токио, Япония", "category": "Развлечения", "rating": 4.8, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1526398977052-654221e39fc2?w=800"]},
        {"title": "Сакура и ханами в парках", "description": "Весенний тур (март-апрель): парки с цветущей сакурой, пикник под деревьями, фотосессия", "price": 6500, "duration": 5, "location": "Токио, Япония", "category": "Природа", "rating": 5.0, "reviews_count": 789, "photos": ["https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800"]},
        {"title": "Изакая-хоппинг: японские пабы", "description": "Посещение 4 традиционных изакая, якитори, сашими, сакэ, пиво, общение с местными", "price": 7200, "duration": 4, "location": "Токио, Япония", "category": "Гастрономия", "rating": 4.9, "reviews_count": 367, "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]},
        {"title": "Шопинг в Ginza: от люкса до vintage", "description": "Designer бутики, универмаги, винтажные магазины, такс-фри оформление, личный стилист", "price": 6800, "duration": 5, "location": "Токио, Япония", "category": "Шопинг", "rating": 4.7, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]},
        
        # Дополнительные туры для Убуда (ещё 2)
        {"title": "Церемония очищения в храме", "description": "Участие в балийской церемонии Melukat, очищение святой водой, благословение от жреца", "price": 4500, "duration": 3, "location": "Убуд, Индонезия", "category": "Культура", "rating": 4.9, "reviews_count": 345, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        {"title": "Батик и резьба по дереву: мастер-класс", "description": "Учимся делать батик, резьба по дереву, создаём сувенир своими руками", "price": 3800, "duration": 4, "location": "Убуд, Индонезия", "category": "Культура", "rating": 4.7, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        
        # Дополнительные туры для Семиньяка (ещё 2)
        {"title": "Sunset cocktails в Ku De Ta", "description": "Легендарный beach club, лучшие коктейли острова, инфинити-пул, диджеи, закат", "price": 5800, "duration": 4, "location": "Семиньяк, Индонезия", "category": "VIP", "rating": 4.9, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]},
        {"title": "Балийский танец Кечак на закате", "description": "Традиционное представление у храма Улувату на скале, огненное шоу, закат над океаном", "price": 4200, "duration": 4, "location": "Семиньяк, Индонезия", "category": "Культура", "rating": 4.8, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"]},
        
        # Дополнительные туры для Киото (ещё 3)
        {"title": "Сакура в философском пути", "description": "Philosopher's Path весной (цветение сакуры), храмы вдоль канала, традиционный обед", "price": 6200, "duration": 5, "location": "Киото, Япония", "category": "Природа", "rating": 5.0, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800"]},
        {"title": "Бамбуковый лес Арасияма", "description": "Прогулка по бамбуковой роще, храм обезьян, мост Тогэцукё, речной круиз", "price": 5500, "duration": 5, "location": "Киото, Япония", "category": "Природа", "rating": 4.9, "reviews_count": 623, "photos": ["https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800"]},
        {"title": "Самурайский опыт", "description": "Переодевание в доспехи самурая, обучение фехтованию на мечах, фотосессия, чайная церемония", "price": 8500, "duration": 3, "location": "Киото, Япония", "category": "Культура", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"]},
        
        # Дополнительные туры для Осаки (ещё 2)
        {"title": "Кулинарный класс: окономияки и такояки", "description": "Готовим 2 главных блюда Осаки с шефом, обед из того что приготовили, рецепты домой", "price": 4800, "duration": 3, "location": "Осака, Япония", "category": "Гастрономия", "rating": 4.9, "reviews_count": 378, "photos": ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"]},
        {"title": "Ночная Осака: Дотонбори и Умеда Sky", "description": "Прогулка по неоновому Дотонбори, затем подъём на небоскрёб Umeda Sky (173м), коктейли с видом", "price": 6500, "duration": 5, "location": "Осака, Япония", "category": "Развлечения", "rating": 4.8, "reviews_count": 456, "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]},
        
        # Дополнительные туры для Ханоя (ещё 2)
        {"title": "Мотобайк-тур по деревням", "description": "Поездка на мотобайке по окрестностям, рисовые поля, деревни, обед в семье фермеров", "price": 4500, "duration": 6, "location": "Ханой, Вьетнам", "category": "Приключения", "rating": 4.8, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        {"title": "Вьетнамский кофе: от зёрен до чашки", "description": "Посещение кофейной плантации, обжарка, помол, заваривание традиционным способом", "price": 3200, "duration": 4, "location": "Ханой, Вьетнам", "category": "Гастрономия", "rating": 4.7, "reviews_count": 234, "photos": ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"]},
        
        # Дополнительные туры для Хошимина (ещё 2)
        {"title": "Уличная еда на мотобайке", "description": "Поездка на заднем сиденье мотобайка по лучшим уличным лоткам, 10+ блюд", "price": 4200, "duration": 4, "location": "Хошимин, Вьетнам", "category": "Гастрономия", "rating": 4.9, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800"]},
        {"title": "Французское наследие Сайгона", "description": "Колониальная архитектура, Нотр-Дам, Центральная почта, французские кафе", "price": 3800, "duration": 4, "location": "Хошимин, Вьетнам", "category": "История", "rating": 4.7, "reviews_count": 298, "photos": ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"]},
        
        # Дополнительные туры для Сеула (ещё 2)
        {"title": "Корейская косметика: K-beauty шопинг", "description": "Лучшие магазины Myeongdong, консультация косметолога, скидки, такс-фри", "price": 4500, "duration": 4, "location": "Сеул, Корея", "category": "Шопинг", "rating": 4.8, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=800"]},
        {"title": "Корейская баня Jjimjilbang опыт", "description": "Традиционная корейская сауна, разные температурные комнаты, массаж, еда в бане", "price": 3500, "duration": 4, "location": "Сеул, Корея", "category": "SPA", "rating": 4.7, "reviews_count": 389, "photos": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]},
        
        # Дополнительные туры для разных городов (5 туров)
        {"title": "Дайвинг на Нуса-Пенида: манты и акулы", "description": "Погружение с мантами (размах до 5м!), риф-шарки, Crystal Bay, 2 дайва", "price": 9500, "duration": 8, "location": "Нуса-Дуа, Индонезия", "category": "Природа", "rating": 5.0, "reviews_count": 523, "photos": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"]},
        {"title": "Ночной Гамчхон: цветная деревня Пусана", "description": "Прогулка по арт-деревне с подсветкой, граффити, кафе, вид на порт", "price": 3800, "duration": 3, "location": "Пусан, Корея", "category": "Культура", "rating": 4.8, "reviews_count": 289, "photos": ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800"]},
        {"title": "Круиз на люксовой яхте по бухте Халонг", "description": "Каюта с панорамными окнами, спа на борту, изысканные ужины, каякинг, 2 дня/1 ночь", "price": 25000, "duration": 36, "location": "Халонг, Вьетнам", "category": "VIP", "rating": 5.0, "reviews_count": 445, "photos": ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]},
        {"title": "Hawker centres: гастро-тур по Сингапуру", "description": "5 лучших фуд-кортов, chicken rice, laksa, chili crab, сатай, ice kachang", "price": 4800, "duration": 4, "location": "Сингапур, Сингапур", "category": "Гастрономия", "rating": 4.9, "reviews_count": 567, "photos": ["https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800"]},
        {"title": "Burj Al Arab: чай в 7-звёздочном отеле", "description": "Afternoon tea в самом роскошном отеле мира, Skyview Bar, фото в лобби, трансфер на Rolls-Royce", "price": 18000, "duration": 3, "location": "Дубай, ОАЭ", "category": "VIP", "rating": 5.0, "reviews_count": 623, "photos": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800"]},
    ]

