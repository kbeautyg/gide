import { TypeAnimation } from 'react-type-animation'

export function TypewriterHero() {
  return (
    <div className="text-center">
      {/* Фиксированная высота для предотвращения сдвига контента */}
      <div className="h-[120px] md:h-[140px] flex items-center justify-center mb-6">
        <TypeAnimation
          sequence={[
            'Откройте Азию с местными гидами',
            2500,
            'Создайте незабываемые воспоминания',
            2500,
            'Путешествуйте как местный житель',
            2500,
            'Исследуйте скрытые жемчужины',
            2500,
          ]}
          wrapper="h1"
          speed={50}
          className="text-4xl md:text-6xl font-bold text-white"
          repeat={Infinity}
        />
      </div>
      <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
        Авторские экскурсии по Азии от профессиональных гидов
      </p>
    </div>
  )
}

