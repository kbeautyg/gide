class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      # Экскурсия
      t.references :tour, foreign_key: true, null: false, index: true
      
      # Клиент
      t.references :client, foreign_key: { to_table: :users }, null: false, index: true
      
      # Бронирование (можно оставить отзыв только после завершения)
      t.references :booking, foreign_key: true, null: false, index: true
      
      # Рейтинг (1-5)
      t.integer :rating, null: false
      
      # Текст отзыва
      t.text :comment
      
      # Фото от клиента
      t.jsonb :photos, default: []
      
      # Модерация
      t.boolean :approved, default: true, null: false
      t.datetime :approved_at
      t.references :approved_by, foreign_key: { to_table: :users }, null: true
      
      # Ответ гида
      t.text :guide_response
      t.datetime :guide_responded_at
      
      t.timestamps
    end
    
    add_index :reviews, [:tour_id, :approved]
    add_index :reviews, [:client_id, :tour_id], unique: true
    add_index :reviews, :rating
  end
end

