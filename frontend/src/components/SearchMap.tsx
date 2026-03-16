import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { formatRUB, getImageUrl } from '@/lib/utils'

// Fix default icon issue
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface SearchMapProps {
  tours: any[]
}

// Приблизительные координаты городов (mock)
const cityCoords: Record<string, [number, number]> = {
  'Пхукет': [7.8804, 98.3923],
  'Бангкок': [13.7563, 100.5018],
  'Паттайя': [12.9236, 100.8825],
  'Самуи': [9.5120, 100.0136],
  'Краби': [9.6025, 99.1360],
  'Чиангмай': [18.7883, 98.9853],
  'Бали': [-8.4095, 115.1889],
  'Токио': [35.6762, 139.6503],
  'Киото': [35.0116, 135.7681],
  'Сеул': [37.5665, 126.9780],
  'Дубай': [25.2048, 55.2708],
  'Стамбул': [41.0082, 28.9784],
  'Тбилиси': [41.7151, 44.8271],
  // Add some randomization for multiple tours in same city
}

export function SearchMap({ tours }: SearchMapProps) {
  // Фильтруем туры, для которых есть координаты города
  const mapTours = tours.filter(t => cityCoords[t.location])

  if (mapTours.length === 0) {
      return (
          <div className="h-full flex items-center justify-center bg-gray-100 text-gray-500">
              Нет данных для отображения на карте
          </div>
      )
  }

  // Центрируем по первому туру или дефолт на Бангкок
  const center: [number, number] = mapTours.length > 0 
    ? cityCoords[mapTours[0].location]
    : [13.7563, 100.5018]

  return (
    <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mapTours.map((tour) => {
          const baseCoords = cityCoords[tour.location]
          // Добавляем небольшой джиттер, чтобы маркеры не слипались
          const lat = baseCoords[0] + (Math.random() - 0.5) * 0.05
          const lng = baseCoords[1] + (Math.random() - 0.5) * 0.05
          
          return (
            <Marker key={tour.id} position={[lat, lng]}>
              <Popup>
                <div className="w-48">
                    <img 
                        src={getImageUrl(tour.photos[0])}
                        alt={tour.title} 
                        className="w-full h-24 object-cover rounded-t-md mb-2"
                    />
                    <Link to={`/tours/${tour.id}`} className="font-bold text-sm hover:text-blue-600 block mb-1">
                        {tour.title}
                    </Link>
                    <div className="text-xs text-gray-500 mb-1">{tour.location}</div>
                    <div className="font-bold text-blue-600">{formatRUB(tour.price)}</div>
                </div>
              </Popup>
            </Marker>
          )
      })}
    </MapContainer>
  )
}


