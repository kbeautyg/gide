import confetti from 'canvas-confetti'

export const useConfetti = () => {
  const fireConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    fire(0.2, {
      spread: 60,
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }

  const fireSideCannons = () => {
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ['#FF385C', '#bd1e59', '#832232']

    ;(function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        zIndex: 9999,
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        zIndex: 9999,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }

  const fireHearts = () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#FF385C', '#ff6b9d', '#ffc0cb'],
      zIndex: 9999,
    }

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 1.2,
      shapes: ['circle'],
    })

    confetti({
      ...defaults,
      particleCount: 25,
      scalar: 2,
      shapes: ['circle'],
    })
  }

  return { fireConfetti, fireSideCannons, fireHearts }
}

