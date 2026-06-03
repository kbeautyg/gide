import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

const RELOAD_KEY = 'errorboundary:chunk-reload-at'
const RELOAD_COOLDOWN_MS = 60_000 // не перезагружаем чаще раза в минуту

/**
 * Возвращает true, если ошибка похожа на ChunkLoadError —
 * браузер пытался подгрузить старый JS-чанк, которого после деплоя уже нет.
 */
function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ВСЕГДА, не только в DEV — иначе в проде ошибки невидимы
    // и пользователь не может ничем помочь, кроме скриншота этого экрана.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo)

    this.setState({ errorInfo })

    // ChunkLoadError после деплоя: пробуем разовый авто-reload.
    if (isChunkLoadError(error)) {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || '0')
        const now = Date.now()
        if (now - last > RELOAD_COOLDOWN_MS) {
          sessionStorage.setItem(RELOAD_KEY, String(now))
          window.location.reload()
        }
      } catch {
        // sessionStorage недоступен — fallback на ручной reload
      }
    }
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false })
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  handleToggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }))
  }

  handleReport = () => {
    const { error, errorInfo } = this.state
    const body = [
      'Здравствуйте! У меня выпала ошибка на сайте.',
      '',
      `URL: ${window.location.href}`,
      `UserAgent: ${navigator.userAgent}`,
      `Время: ${new Date().toISOString()}`,
      '',
      `Ошибка: ${error?.name || 'Error'}: ${error?.message || 'unknown'}`,
      '',
      'Stack:',
      error?.stack || '(no stack)',
      '',
      'Component stack:',
      errorInfo?.componentStack || '(no component stack)',
    ].join('\n')
    const url = `mailto:help@inturex.pro?subject=${encodeURIComponent(
      'Ошибка на сайте Inturex'
    )}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { error, errorInfo, showDetails } = this.state
    const isChunk = isChunkLoadError(error)

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="text-center max-w-lg w-full">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Что-то пошло не так</h1>
          <p className="text-gray-600 mb-6">
            {isChunk
              ? 'Сайт обновился, пока страница была открыта. Перезагрузите, чтобы продолжить.'
              : 'Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <button
              onClick={this.handleReload}
              className="bg-[#FF385C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FF385C]/90 transition-colors"
            >
              Перезагрузить
            </button>
            <button
              onClick={this.handleGoHome}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              На главную
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              onClick={this.handleToggleDetails}
              className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
            >
              {showDetails ? 'Скрыть детали' : 'Подробности'}
            </button>
            <span className="text-gray-300">·</span>
            <button
              onClick={this.handleReport}
              className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
            >
              Сообщить о проблеме
            </button>
          </div>

          {showDetails && (
            <div className="mt-6 text-left bg-white border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-700 max-h-72 overflow-auto">
              <div className="font-semibold text-gray-900 mb-1">
                {error?.name || 'Error'}: {error?.message || 'unknown'}
              </div>
              {error?.stack && (
                <pre className="whitespace-pre-wrap break-words text-gray-600">{error.stack}</pre>
              )}
              {errorInfo?.componentStack && (
                <>
                  <div className="font-semibold text-gray-900 mt-3 mb-1">Component stack</div>
                  <pre className="whitespace-pre-wrap break-words text-gray-600">
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}
