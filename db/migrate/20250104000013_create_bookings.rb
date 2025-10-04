class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings do |t|
      # Экскурсия
      t.references :tour, foreign_key: true, null: false, index: true
      
      # Клиент
      t.references :client, foreign_key: { to_table :users }, null: false, index: true
      
      # Дата экскурсии
      t.date :tour_date, null: false
      t.time :tour_time
      
      # Количество участников
      t.integer :participants_count, null: false, default: 1
      
      # Цена
      t.decimal :price_per_person, precision: 10, scale: 2, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.string :currency, default: 'THB', null: false
      
      # Контактные данные клиента
      t.string :client_name, null: false
      t.string :client_phone, null: false
      t.string :client_email
      t.text :client_notes
      
      # Статус бронирования
      t.integer :status, default: 0, null: false # 0=pending, 1=confirmed, 2=cancelled, 3=completed
      
      # Статус оплаты
      t.integer :payment_status, default: 0, null: false # 0=pending, 1=paid, 2=refunded
      
      # Связь с транзакцией оплаты
      t.references :transaction, foreign_key: true, null: true
      
      # Ваучер
      t.string :voucher_code
      
      # Подтверждение/отмена
      t.datetime :confirmed_at
      t.datetime :cancelled_at
      t.text :cancellation_reason
      
      # Связь с кэшбук-картой (если использовалась)
      t.boolean :paid_with_cashbook, default: false
      
      t.timestamps
    end
    
    add_index :bookings, :status
    add_index :bookings, :payment_status
    add_index :bookings, :tour_date
    add_index :bookings, :voucher_code, unique: true
    add_index :bookings, [:client_id, :status]
  end
end

