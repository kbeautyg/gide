/**
 * Глобальные перехватчики ошибок, которые React ErrorBoundary не ловит:
 * - window.onerror — синхронные ошибки в обработчиках событий, setTimeout, etc.
 * - unhandledrejection — необработанные промисы (включая fetch'и).
 *
 * Также детектируем ChunkLoadError и делаем разовый авто-reload
 * (на случай если устаревший SPA пытается подгрузить чанк, которого
 * после деплоя больше нет в /assets).
 */

const CHUNK_RELOAD_KEY = 'globalerr:chunk-reload-at'
const CHUNK_RELOAD_COOLDOWN_MS = 60_000

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

function tryChunkReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0')
    const now = Date.now()
    if (now - last > CHUNK_RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now))
      window.location.reload()
      return true
    }
  } catch {
    // sessionStorage недоступен (приватный режим / iframe) — оставляем как есть
  }
  return false
}

let installed = false

export function installGlobalErrorHandlers(): void {
  if (installed) return
  installed = true

  window.addEventListener('error', (event) => {
    // eslint-disable-next-line no-console
    console.error('[window.error]', event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
    if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
      tryChunkReload()
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    // eslint-disable-next-line no-console
    console.error('[unhandledrejection]', event.reason)
    if (isChunkLoadError(event.reason)) {
      tryChunkReload()
    }
  })
}
