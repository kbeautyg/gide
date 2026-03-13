import { useContext } from 'react'
import NavigationContext from '@/contexts/NavigationContext'
import { NavigationContextValue } from '@/types/navigation'

/**
 * Хук для работы с навигацией и фильтрами
 * Должен использоваться внутри NavigationProvider
 */
export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext)
  
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  
  return context
}


