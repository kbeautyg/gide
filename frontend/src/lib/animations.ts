/**
 * Framer Motion анимационные варианты для переиспользования
 */

// Fade-in при появлении в viewport
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

// Fade-in слева
export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
}

// Fade-in справа
export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
}

// Stagger-контейнер для сетки элементов
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

// Элемент в stagger-сетке
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

// Hover-эффект для карточек
export const cardHover = {
  scale: 1.02,
  y: -4,
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  transition: { duration: 0.2 }
}

// Анимация появления модального окна
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
}

// Анимация slide-in панели
export const slideInRight = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200
    }
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2
    }
  }
}

// Анимация для skeleton loader
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Плавное появление overlay
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
}

// Анимация для dropdown меню
export const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
}

// Анимация числовых изменений (для счётчиков)
export const numberChange = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  }
}

// Анимация появления toast-уведомлений
export const toastVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2
    }
  }
}
