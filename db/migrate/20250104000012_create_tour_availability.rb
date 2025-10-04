class CreateTourAvailability < ActiveRecord::Migration[7.1]
  def change
    create_table :tour_availabilities do |t|
      # Экскурсия
      t.references :tour, foreign_key: true, null: false, index: true
      
      # Дата
      t.date :date, null: false
      
      # Доступные и забронированные места
      t.integer :available_slots, null: false
      t.integer :booked_slots, default: 0, null: false
      
      # Специальная цена на эту дату (если отличается от базовой)
      t.decimal :special_price, precision: 10, scale: 2, null: true
      
      # Статус
      t.boolean :available, default: true, null: false
      
      # Причина недоступности
      t.string :unavailable_reason
      
      t.timestamps
    end
    
    add_index :tour_availabilities, [:tour_id, :date], unique: true
    add_index :tour_availabilities, [:date, :available]
  end
end

