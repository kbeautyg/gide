import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Что-то пошло не так</h1>
            <p className="text-gray-600 mb-8">
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-[#FF385C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#FF385C]/90 transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
