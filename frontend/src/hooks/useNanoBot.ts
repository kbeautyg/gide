import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate, useLocation } from 'react-router-dom'
import { collectFullContext, trackPageVisit } from '@/utils/contextCollector'
import { useAuth } from './useAuth'
import { toursApi } from '@/lib/api'

// n8n webhook URL
const N8N_WEBHOOK_URL = 'https://n8n3-production-bef1.up.railway.app/webhook/webhook/chat'

// Rich UI Message Types
export interface RichContent {
  type: 'tour_card' | 'tours_carousel' | 'lead_form' | 'steal_deal' | 'quick_booking' | 'text'
  data?: {
    tourId?: number
    title?: string
    image?: string
    price?: number
    discount?: number
    rating?: number
    location?: string
    duration?: string
    formFields?: string[]
    tours?: Array<{
      tourId: number
      title: string
      image?: string
      price: number
      discount?: number
      rating?: number
      location?: string
      duration?: string
    }>
    availableDates?: Array<{
      date: string
      available: boolean
    }>
  }
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
  type?: 'text' | 'image' | 'action' | 'rich'
  richContent?: RichContent
  actions?: Array<{ label: string, value: string, type: 'button' | 'link' }>
}

// Proactive trigger messages based on page
const TRIGGER_MESSAGES: Record<string, { delay: number, message: string, actions?: Message['actions'] }> = {
  '/': {
    delay: 20000, // 20 seconds on homepage
    message: 'Хе-хе, вижу ты только зашёл! 🎄 Хочешь узнать про самые выгодные туры? Я знаю пару секретов... 🤫',
    actions: [
      { label: '🎁 Покажи секреты!', value: 'show_best_deals', type: 'button' },
      { label: '🗺️ Куда поехать?', value: 'help_choose_destination', type: 'button' }
    ]
  },
  '/tours': {
    delay: 15000, // 15 seconds on tours page
    message: 'Хе-хе... Вижу, ты ищешь приключения! Хочешь, украду для тебя секретную скидку? 😏',
    actions: [
      { label: '🎁 Украсть скидку!', value: 'steal_discount', type: 'button' },
      { label: '🗺️ Подобрать тур', value: 'help_choose_tour', type: 'button' }
    ]
  },
  '/tours/': {
    delay: 25000, // 25 seconds on specific tour page
    message: 'Псс! Этот тур классный, но я знаю, как сделать его дешевле... Интересует? 🤫',
    actions: [
      { label: '💸 Хочу дешевле!', value: 'get_discount_for_this', type: 'button' },
      { label: '📝 Забронировать', value: 'book_this_tour', type: 'button' },
      { label: '❓ Есть вопросы', value: 'ask_about_tour', type: 'button' }
    ]
  },
  '/contact': {
    delay: 10000, // 10 seconds on contact page
    message: 'Ищешь как связаться? Можешь просто написать мне! Я отвечу быстрее 📞',
    actions: [
      { label: '💬 Написать сейчас', value: 'start_chat', type: 'button' }
    ]
  }
}

// Human readable labels for technical commands
const COMMAND_LABELS: Record<string, string> = {
  'steal_discount': '🎁 Хочу украсть скидку!',
  'help_choose_tour': '🗺️ Помоги подобрать тур',
  'get_discount_for_this': '💸 Хочу дешевле этот тур',
  'book_this_tour': '📝 Хочу забронировать',
  'ask_about_tour': '❓ Есть вопрос по туру',
  'ask_dates': '📅 Когда есть места?',
  'ask_included': '💰 Что входит в цену?',
  'ask_hotel': '🏨 Какой там отель?',
  'ask_transfer': '✈️ Как добраться?',
  'claim_steal_deal': '🤫 Беру скидку!',
  'show_best_deals': '👀 Покажи лучшие предложения',
  'view_all_tours': '🔍 Посмотреть все туры',
  'search_beach': '🏖️ Хочу на пляж',
  'search_adventure': '🏔️ Хочу в горы',
  'search_exotic': '🐘 Хочу экзотики',
  'search_culture': '🏛️ Интересна культура',
  'start_chat': '💬 Привет, Гринч!',
  'ask_question': '❓ У меня есть вопрос'
}

// Quick response templates for common actions
const QUICK_RESPONSES: Record<string, { response: string, richContent?: RichContent, actions?: Message['actions'] }> = {
  'steal_discount': {
    response: 'Ха! Ты мне нравишься! 😏 Дай-ка гляну, что можно стащить...',
    richContent: { type: 'steal_deal', data: { discount: 15 } }
  },
  'help_choose_tour': {
    response: 'Так-так... Куда хочешь отправиться? Пляжи, горы, или может экзотика? 🌴🏔️🐘',
    actions: [
      { label: '🏖️ Пляжный отдых', value: 'search_beach', type: 'button' },
      { label: '🏔️ Горы/Активный', value: 'search_adventure', type: 'button' },
      { label: '🐘 Экзотика', value: 'search_exotic', type: 'button' },
      { label: '🏛️ Экскурсии', value: 'search_culture', type: 'button' }
    ]
  },
  'get_discount_for_this': {
    response: 'Хм, интересненько... 😏 Хочешь цену пониже? Давай обсудим!',
    richContent: { type: 'lead_form' }
  },
  'book_this_tour': {
    response: 'О, вижу глаз алмаз! 💎 Отличный выбор. Оформляем?',
    richContent: { type: 'lead_form' }
  },
  'ask_about_tour': {
    response: 'Спрашивай! Я знаю об этом туре всё! 😏',
    actions: [
      { label: '📅 Даты и наличие', value: 'ask_dates', type: 'button' },
      { label: '💰 Что входит в цену', value: 'ask_included', type: 'button' },
      { label: '🏨 Про отель', value: 'ask_hotel', type: 'button' },
      { label: '✈️ Как добраться', value: 'ask_transfer', type: 'button' }
    ]
  },
  'claim_steal_deal': {
    response: 'Скидка твоя! 🎉 Теперь оставь контакты, и я всё оформлю!',
    richContent: { type: 'lead_form' }
  },
  'show_best_deals': {
    response: 'Вот что я нашёл специально для тебя! Самые горячие предложения 🔥',
    actions: [
      { label: '👀 Показать все туры', value: 'view_all_tours', type: 'button' }
    ]
  },
  'ask_question': {
    response: 'Спрашивай что угодно! Я помогу найти идеальный тур 🗺️',
  }
}

// Helper: Smart Search function with tag-based matching
const findTours = (query: string, tours: any[]) => {
  if (!tours || tours.length === 0) return { tours: [], found: false }

  const lowerQuery = query.toLowerCase()
  
  // 1. Try to extract price limit (handle both "5000" and "5к")
  const priceMatch = lowerQuery.match(/(\d+)\s*к/) || lowerQuery.match(/(\d{4,})/)
  let maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null
  if (priceMatch && lowerQuery.includes('к')) maxPrice = (maxPrice || 0) * 1000
  
  // 2. Keywords for matching
  const keywords = lowerQuery
    .replace(/[^\wа-яё]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)

  // 3. Category/theme mappings for button commands
  const categoryMappings: Record<string, string[]> = {
    'search_beach': ['пляж', 'море', 'остров', 'снорклинг', 'дайвинг', 'купание', 'ocean', 'beach'],
    'search_adventure': ['горы', 'активный', 'приключения', 'треккинг', 'поход', 'экстрим', 'adventure'],
    'search_exotic': ['экзотика', 'джунгли', 'сафари', 'природа', 'wildlife', 'exotic'],
    'search_culture': ['храм', 'история', 'культура', 'музей', 'экскурсия', 'architecture', 'culture'],
    'show_best_deals': [] // Will use discount logic
  }

  // Check if query is a category button
  const isCategoryButton = Object.keys(categoryMappings).includes(query)
  const categoryKeywords = isCategoryButton ? categoryMappings[query] : []

  // 3. Score each tour
  const scoredTours = tours.map(tour => {
    let score = Math.random() * 2 // Small random factor to vary results
    
    const tourText = [
      tour.title,
      tour.location,
      tour.category,
      tour.description,
      ...(tour.tags || []),
      ...(tour.themes || [])
    ].join(' ').toLowerCase()

    // Price constraint
    if (maxPrice) {
      if (tour.price <= maxPrice) score += 15
      else if (tour.price <= maxPrice * 1.3) score += 5
      else score -= 5
    }

    // Keyword matching from user query
    keywords.forEach(word => {
      if (tourText.includes(word)) score += 8
      // Partial match for longer words
      if (word.length > 4 && tourText.includes(word.substring(0, 4))) score += 3
    })

    // Category button matching
    categoryKeywords.forEach(keyword => {
      if (tourText.includes(keyword)) score += 12
    })

    // Best deals - prioritize discounted tours
    if (query === 'show_best_deals') {
      if (tour.has_discount || tour.discount_percentage) score += 20
      score += 5 // All tours get base score for "best deals"
    }

    // Location-based bonuses for common destinations
    const locationBonuses: Record<string, string[]> = {
      'таиланд': ['тай', 'пхукет', 'паттай', 'бангкок', 'самуи', 'краби'],
      'вьетнам': ['вьет', 'нячанг', 'фукуок', 'ханой', 'хошимин', 'дананг'],
      'индонезия': ['бали', 'индонез', 'ломбок', 'джакарта'],
      'китай': ['кита', 'пекин', 'шанхай', 'гонконг', 'чунцин', 'чэнду'],
      'турция': ['турц', 'стамбул', 'анталь', 'каппадок', 'фетхие'],
      'индия': ['инди', 'гоа', 'дели', 'мумбай', 'агра', 'варанаси'],
      'корея': ['коре', 'сеул', 'пусан', 'чеджу', 'кёнджу'],
      'япония': ['япон', 'токио', 'киото', 'осака']
    }

    Object.entries(locationBonuses).forEach(([country, variants]) => {
      if (variants.some(v => lowerQuery.includes(v)) && tour.location?.toLowerCase().includes(country)) {
        score += 25
      }
    })

    return { ...tour, score }
  })

  // 4. Sort by score with randomization for ties
  const sorted = scoredTours
    .sort((a, b) => {
      const diff = b.score - a.score
      return Math.abs(diff) < 3 ? Math.random() - 0.5 : diff
    })

  // 5. Get top results
  // For explicit searches (high score), we want strict filtering
  const minScore = isCategoryButton ? 5 : 15 
  const results = sorted.filter(t => t.score >= minScore).slice(0, 5)

  // 6. Fallback logic
  // If we found something relevant -> return it
  if (results.length > 0) {
    return { tours: results, found: true }
  }

  // If nothing relevant found AND it was a specific search query (not general button) -> return empty to let AI handle "Not found"
  if (!isCategoryButton && keywords.length > 0) {
     return { tours: [], found: false }
  }

  // Fallback to random ONLY for general/empty queries
  const randomTours = [...tours]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
  return { tours: randomTours, found: false }
}

export function useNanoBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    // Restore history from localStorage on init
    try {
      const stored = localStorage.getItem('nano_bot_messages')
      const expiry = localStorage.getItem('nano_bot_messages_expiry')
      if (stored && expiry && Date.now() < parseInt(expiry)) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to restore history', e)
    }
    return []
  })
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => localStorage.getItem('nano_bot_session_id') || uuidv4())
  const [hasTriggered, setHasTriggered] = useState<Record<string, boolean>>({})
  const [availableTours, setAvailableTours] = useState<any[]>([])
  const [userIp, setUserIp] = useState<string>('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const triggerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuth()

  // Track page visits for Grinch context
  useEffect(() => {
    trackPageVisit()
  }, [location.pathname])

  // Persist messages and update expiry
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nano_bot_messages', JSON.stringify(messages))
      localStorage.setItem('nano_bot_messages_expiry', (Date.now() + 2 * 60 * 60 * 1000).toString()) // 2 hours
    }
  }, [messages])

  // Save session ID
  useEffect(() => {
    localStorage.setItem('nano_bot_session_id', sessionId)
  }, [sessionId])

  // Load User IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(err => console.error('Failed to get IP', err))
  }, [])

  // ============ LOAD TOURS (WITH RETRY) ============
  const loadToursRef = useRef<() => Promise<any[]>>(() => Promise.resolve([]))
  
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 5000 // 5 seconds between retries

    const loadTours = async (): Promise<any[]> => {
      try {
        const response = await toursApi.getList({ page_size: 1000, page: 1 })
        const tours = response.data.tours.map((tour: any) => ({
          id: tour.id,
          title: tour.title,
          description: tour.description || '',
          price: tour.price,
          location: tour.location || 'Азия',
          category: tour.category || '',
          tags: tour.tags || [],
          themes: tour.themes || [],
          has_discount: tour.has_discount || false,
          discount_percentage: tour.discount_percentage || 0,
          image: tour.photos?.[0] || '',
          rating: tour.rating || 4.8,
          duration: tour.duration ? `${tour.duration} ч` : '3 ч'
        }))
        
        console.log(`🎄 Гринч загрузил ${tours.length} туров`)
        
        setAvailableTours(tours)
        return tours
      } catch (error) {
        console.error(`Failed to load tours for Grinch (attempt ${retryCount + 1}/${maxRetries}):`, error)
        
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`🔄 Гринч: повтор загрузки туров через ${retryDelay / 1000}с...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return loadTours()
        }
        return []
      }
    }

    loadToursRef.current = loadTours
    loadTours()
  }, [])

  // ============ SMART TRIGGERS ============
  useEffect(() => {
    const currentPath = window.location.pathname

    // Find matching trigger
    let matchedTrigger: typeof TRIGGER_MESSAGES[string] | null = null
    let triggerKey = ''

    // Check for exact or prefix match
    for (const [path, trigger] of Object.entries(TRIGGER_MESSAGES)) {
      if (currentPath === path || (path.endsWith('/') && currentPath.startsWith(path) && path !== '/')) {
        matchedTrigger = trigger
        triggerKey = path
        break
      }
    }

    // Special case for homepage
    if (currentPath === '/' && !matchedTrigger) {
      matchedTrigger = TRIGGER_MESSAGES['/']
      triggerKey = '/'
    }

    // Don't trigger if already opened, already triggered for this path, or no match
    // ALSO FIX: Don't trigger if user has already started chatting (messages exist)
    if (!matchedTrigger || isOpen || hasTriggered[triggerKey] || messages.length > 0) {
      return
    }

    // Set timeout for proactive message
    triggerTimeoutRef.current = setTimeout(() => {
      // Only trigger if still not opened and no messages yet
      if (!isOpen && messages.length === 0) {
        setIsOpen(true)
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: matchedTrigger!.message,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'text',
          actions: matchedTrigger!.actions
        }])
        setHasTriggered(prev => ({ ...prev, [triggerKey]: true }))
      }
    }, matchedTrigger.delay)

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current)
      }
    }
  }, [isOpen, hasTriggered])

  const sendMessage = useCallback(async (text: string, displayLabel?: string) => {
    // Check for client-side view/book actions FIRST (before adding to chat)
    if (text.startsWith('view_tour_')) {
      const tourId = text.replace('view_tour_', '')
      navigate(`/tours/${tourId}`)
      return
    }

    // If text looks like a lead form submission (lead_form:name:phone), don't show it as a message or show a confirmation
    if (text.startsWith('lead_form:')) {
      // Don't add user message for form submission, it's handled by the form UI state
      // or add a "Form submitted" system message if needed
    } else {
      // Determine what to show in chat
      const displayText = displayLabel || COMMAND_LABELS[text] || text

      // Add user message
      const userMsg: Message = {
        id: uuidv4(),
        text: displayText,
        sender: 'user',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, userMsg])
    }

    setIsTyping(true)

    try {
      // Check for client-side book action
      if (text.startsWith('book_tour_')) {
        await new Promise(resolve => setTimeout(resolve, 800))
        const botMsg: Message = {
          id: uuidv4(),
          text: 'Отличный выбор! Оставь свои контакты, и мы оформим всё в лучшем виде! 📝',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'rich',
          richContent: { type: 'lead_form' }
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
        return
      }

      // Check for quick responses first
      const quickResponse = QUICK_RESPONSES[text]
      
      // Handle category searches specially to show tours immediately
      const isCategorySearch = ['search_beach', 'search_adventure', 'search_exotic', 'search_culture', 'show_best_deals'].includes(text)

      // Only search for tours if it is a category search OR text contains explicit search intent
      // This prevents "hello" from triggering a random tour search
      const isSearchIntent = text.match(/(тур|экскурси|поездк|билет|цен|стоит|хочу|покажи|найди|\d{3,}|таиланд|вьетнам|турци|пхукет|паттайя|бангкок|самуи|краби|чиангмай)/i)
      const shouldSearch = isCategorySearch || (!quickResponse && !text.startsWith('lead_form:') && isSearchIntent)

      if (quickResponse || shouldSearch) {
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600))
        
        let richContent: RichContent | undefined = quickResponse?.richContent
        let responseText: string | undefined = quickResponse?.response
        let actions = quickResponse?.actions

        // Logic for tours carousel
        if (shouldSearch && availableTours.length > 0) {
          const { tours: foundTours, found } = findTours(text, availableTours)
          
          if (found) {
            if (!responseText) {
               // Generate dynamic response based on query
               const lower = text.toLowerCase()
               if (lower.includes('цен') || lower.includes('стоит') || text.match(/\d+/)) {
                   responseText = 'Нашел для тебя самые выгодные варианты! 💸 Смотри:'
               } else if (lower.includes('пляж')) {
                   responseText = 'Вот они, лучшие места для загара! 🏖️'
               } else if (lower.includes('гор')) {
                   responseText = 'Выше гор только мои скидки! 🏔️ Выбирай:'
               } else {
                   responseText = 'Хе-хе, смотри что я откопал специально для тебя! 💎'
               }
            }
          } else {
             // IF NOT FOUND and NOT EXPLICIT CATEGORY SEARCH -> fallback to n8n (AI)
             // But if it IS an explicit category search (e.g. button click), fallback to random
             if (isCategorySearch) {
                 responseText = 'Хм, я не нашел точно такого... Но посмотри вот эти крутые туры! Гринч плохого не посоветует! 🎄'
                 // Use random tours as fallback only for explicit categories
             } else {
                 // Not found and not explicit -> let N8N handle it
                 if (!quickResponse) {
                     richContent = undefined
                     responseText = undefined
                 }
             }
          }

          if ((found || isCategorySearch) && (responseText || richContent)) {
             const toursToShow = found ? foundTours : (isCategorySearch ? availableTours.sort(() => 0.5 - Math.random()).slice(0, 5) : [])
             
             if (toursToShow.length > 0) {
                richContent = {
                    type: 'tours_carousel',
                    data: {
                      tours: toursToShow.map((t: any) => ({
                        tourId: t.id,
                        title: t.title,
                        image: t.image,
                        price: t.price,
                        rating: t.rating,
                        location: t.location,
                        duration: t.duration,
                        discount: Math.random() > 0.5 ? Math.floor(Math.random() * 20 + 5) : undefined
                      }))
                    }
                  }
             }
          }
        }

        // If we have content to show (either quick response or search result), show it!
        if (responseText || richContent) {
            const botMsg: Message = {
              id: uuidv4(),
              text: responseText || 'Вот что есть:',
              sender: 'bot',
              timestamp: new Date().toISOString(),
              type: richContent ? 'rich' : 'text',
              richContent,
              actions
            }
            setMessages(prev => [...prev, botMsg])
            setIsTyping(false)
            return
        }
      }

      // If tours are empty, try to reload before sending to AI
      let toursForContext = availableTours
      if (toursForContext.length === 0) {
        console.log('🔄 Гринч: туры не загружены, пробуем перезагрузить...')
        try {
          const reloaded = await loadToursRef.current()
          if (reloaded && reloaded.length > 0) {
            toursForContext = reloaded
          }
        } catch (e) {
          console.error('Failed to reload tours before AI call:', e)
        }
      }

      // Collect full context for AI
      const context = collectFullContext(
        toursForContext,
        user,
        userIp || sessionId // Use IP as chat key if available
      )

      // Get last few messages for context (exclude system/trigger messages if needed, or keep all)
      const historyContext = messages
        .slice(-6) // Last 6 messages
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))

      // Send to n8n
      const response = await axios.post(N8N_WEBHOOK_URL, {
        message: text,
        chat_history: historyContext,
        ...context
      })

      // Process bot response - handle both direct object and JSON string
      let botResponse = response.data
      
      // 0. Unwrap Array if n8n returns an array (common behavior)
      if (Array.isArray(botResponse) && botResponse.length > 0) {
          botResponse = botResponse[0]
      }
      
      // Validation: Check for empty response
      if (!botResponse) throw new Error('Empty response from API')
      
      // Helper to clean and parse JSON more aggressively
      const cleanAndParse = (input: any) => {
        if (typeof input !== 'string') return input
        
        let clean = input.trim()
        
        // 1. Try to find JSON object bounds if brackets exist
        const firstBracket = clean.indexOf('{')
        const lastBracket = clean.lastIndexOf('}')
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
           clean = clean.substring(firstBracket, lastBracket + 1)
        }

        // 2. Remove markdown code blocks (just in case they are inside or remained)
        clean = clean.replace(/```json\s?|```/g, '').trim()
        
        // 3. Try standard JSON.parse first
        try {
          return JSON.parse(clean)
        } catch {
          // 4. FIX: Replace real newlines INSIDE string values with escaped \n
          // This regex matches JSON string literals and escapes newlines within them
          const fixedNewlines = clean.replace(/"([^"\\]|\\.)*"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
          })
          
          try {
            return JSON.parse(fixedNewlines)
          } catch {
            // 5. Last resort: extract "response" field via regex
            const responseMatch = clean.match(/"response"\s*:\s*"([\s\S]*?)"\s*[,}]/)
            if (responseMatch) {
              // Unescape the extracted text
              const extractedText = responseMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
              return { response: extractedText }
            }
            // If all else fails, return original input as plain text
            return input
          }
        }
      }

      // If response is a string, try to parse it
      botResponse = cleanAndParse(botResponse)
      
      // CRITICAL FIX: If botResponse is still a string after parsing (means it wasn't JSON),
      // treat it as the message text directly!
      if (typeof botResponse === 'string') {
          botResponse = {
              response: botResponse,
              text: botResponse
          }
      }

      // Handle common output wrappers from n8n/webhooks
      if (botResponse && typeof botResponse === 'object') {
          // If response is wrapped in "output" or "data" or "json" property
          if (!botResponse.response && !botResponse.richContent && !botResponse.text) {
             if (botResponse.output) botResponse = botResponse.output
             else if (botResponse.data) botResponse = botResponse.data
             else if (botResponse.json) botResponse = botResponse.json
             
             // Check if unwrapped value is a string and needs parsing
             if (typeof botResponse === 'string') {
                 const parsed = cleanAndParse(botResponse)
                 if (typeof parsed === 'object') {
                     botResponse = parsed
                 } else {
                     botResponse = { response: botResponse }
                 }
             }
          }
      }
      
      // If botResponse.response is a JSON string (AI returned JSON as text nested), parse it
      if (typeof botResponse?.response === 'string') {
         const parsed = cleanAndParse(botResponse.response)
         if (typeof parsed === 'object') {
            botResponse = { ...botResponse, ...parsed }
         }
      }
      
      // Also check if the entire response.text is JSON
      if (typeof botResponse?.text === 'string') {
         const parsed = cleanAndParse(botResponse.text)
         if (typeof parsed === 'object') {
            botResponse = { ...botResponse, ...parsed }
         }
      }

      // Check for empty content after parsing
      if (!botResponse.response && !botResponse.text && !botResponse.richContent) {
          throw new Error('Empty content in response')
      }

      // ============ HYDRATION FIX: FILL DATA FROM CLIENT CACHE ============
      // FIX 1: Normalize richContent structure if AI forgot "type" or "data" wrapper
      if (botResponse?.richContent) {
          // Case: richContent.tours (direct array)
          if (Array.isArray(botResponse.richContent.tours)) {
              botResponse.richContent = {
                  type: 'tours_carousel',
                  data: { tours: botResponse.richContent.tours }
              }
          }
          // Case: richContent.data.tours but missing type
          else if (botResponse.richContent.data?.tours && !botResponse.richContent.type) {
              botResponse.richContent.type = 'tours_carousel'
          }
      }

      // The AI might return incomplete data or missing IDs. We fix this here.
      if (botResponse?.richContent?.type === 'tours_carousel' && botResponse?.richContent?.data?.tours) {
          console.log('[Grinch] Raw tours from AI:', botResponse.richContent.data.tours)
          
          botResponse.richContent.data.tours = botResponse.richContent.data.tours.map((t: any) => {
              // 1. Resolve ID (handle string/number mismatch and "id" vs "tourId")
              const rawId = t.tourId || t.id
              const foundTour = availableTours.find(at => at.id == rawId) // loose equality for string/number
              
              if (foundTour) {
                  console.log(`[Grinch] Hydrating tour ${rawId} -> ${foundTour.title}`)
                  return {
                      ...t,
                      tourId: foundTour.id, // Ensure correct ID
                      title: t.title || foundTour.title,
                      image: foundTour.image || t.image, // Prefer our cache as it has correct URLs
                      price: t.price || foundTour.price,
                      location: t.location || foundTour.location,
                      rating: t.rating || foundTour.rating
                  }
              }
              
              // Fallback if not found in cache
              console.warn(`[Grinch] Tour ${rawId} not found in cache`)
              return {
                  ...t,
                  tourId: rawId // Ensure tourId is set even if not found
              }
          })

          // CRITICAL FIX: If after filtering/hydration we have NO valid tours, drop the rich content!
          // This prevents empty carousels from hiding the text message.
          if (botResponse.richContent.data.tours.length === 0) {
              console.warn('[Grinch] Received empty tour list from AI. Dropping rich content to show text.')
              botResponse.richContent = undefined
          }
      } else if (botResponse?.richContent?.type === 'tours_carousel' && (!botResponse?.richContent?.data?.tours || botResponse?.richContent?.data?.tours.length === 0)) {
          // Handle case where tours array is explicitly empty or missing
          console.warn('[Grinch] Empty tours carousel received. Dropping rich content.')
          botResponse.richContent = undefined
      }

      // Check for completely empty richContent object (e.g. "richContent": {})
      if (botResponse?.richContent && typeof botResponse.richContent === 'object' && Object.keys(botResponse.richContent).length === 0) {
          console.warn('[Grinch] Received empty richContent object. Dropping it.')
          botResponse.richContent = undefined
      }
      // ====================================================================

      // FINAL SAFETY CHECK: If the text content looks like JSON, try to parse it one last time.
      // This prevents users from seeing raw JSON strings in the chat bubble.
      let finalText = botResponse.response || botResponse.text || 'Хм, что-то я замешкался... Попробуй ещё раз! 😅'
      if (typeof finalText === 'string' && finalText.trim().startsWith('{') && finalText.trim().endsWith('}')) {
          try {
             const nestedParsed = JSON.parse(finalText)
             if (nestedParsed.response) finalText = nestedParsed.response
             // Also checking if richContent was hidden inside
             if (nestedParsed.richContent && !botResponse.richContent) {
                 botResponse.richContent = nestedParsed.richContent
             }
          } catch (e) {
              // Ignore parse error, it might be just text starting with {
          }
      }

      const botMsg: Message = {
        id: uuidv4(),
        text: finalText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: botResponse.richContent ? 'rich' : 'text',
        richContent: botResponse.richContent,
        actions: botResponse.actions
      }

      setMessages(prev => [...prev, botMsg])

    } catch (error) {
      console.error('Grinch Error:', error)
      
      // Fallback response
      const fallbackResponses = [
        'Упс! Кто-то перерезал провода... Попробуй позже! 🔧',
        'Ой, Санта что-то сломал! Попробуй ещё разок! 🎅❌',
        'Хм, связь барахлит... Напиши попроще, я пойму! 📡'
      ]
      
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        sender: 'bot',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsTyping(false)
    }
  }, [user, sessionId, availableTours, navigate, userIp])

  return {
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
    messages,
    sendMessage,
    isTyping,
    availableTours
  }
}
