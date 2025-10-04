class CreateTours < ActiveRecord::Migration[7.1]
  def change
    create_table :tours do |t|
      # Менеджер-гид, который создал экскурсию
      t.references :manager, foreign_key: { to_table: :users }, null: false, index: true
      
      # Основная информация
      t.string :title, null: false
      t.text :description, null: false
      t.text :route_description
      t.text :included_services # Что входит в стоимость
      t.text :excluded_services # Что не входит
      
      # Цена и длительность
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :currency, default: 'THB', null: false
      t.integer :duration_hours, null: false # Длительность в часах
      t.integer :duration_days, default: 1 # Длительность в днях
      
      # Локация
      t.string :city, null: false # Phuket, Bangkok, Pattaya
      t.string :meeting_point
      t.decimal :latitude, precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
      
      # Ограничения
      t.integer :min_participants, default: 1
      t.integer :max_participants, default: 10
      
      # Категория и теги
      t.string :category # Экскурсии, Активный отдых, Морские прогулки, etc.
      t.string :tags, array: true, default: []
      
      # Рейтинг
      t.decimal :rating, precision: 3, scale: 2, default: 0.0
      t.integer :reviews_count, default: 0
      
      # Фото (массив URL или JSON)
      t.jsonb :photos, default: []
      t.string :cover_photo # Главное фото
      
      # Статус
      t.boolean :active, default: true, null: false
      t.boolean :featured, default: false # Рекомендуемая экскурсия
      
      # Статистика
      t.integer :views_count, default: 0
      t.integer :bookings_count, default: 0
      
      t.timestamps
    end
    
    add_index :tours, :active
    add_index :tours, :city
    add_index :tours, :category
    add_index :tours, [:manager_id, :active]
    add_index :tours, :rating
  end
end

