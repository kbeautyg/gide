import { useEffect, useState, useRef } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export const useKonamiCode = (callback: () => void) => {
  const [keys, setKeys] = useState<string[]>([])
  const callbackRef = useRef(callback)

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, e.key].slice(-KONAMI_CODE.length)
        
        // Проверяем совпадение
        const matches = KONAMI_CODE.every((key, index) => key === newKeys[index])
        
        if (matches) {
          callbackRef.current()
          return [] // Сброс после успеха
        }
        
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // Убрали callback из зависимостей

  return keys
}

