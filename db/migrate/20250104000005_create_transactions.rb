class CreateTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :transactions do |t|
      # Менеджер, который создал транзакцию
      t.references :manager, foreign_key: { to_table: :users }, null: false, index: true
      
      # Клиент (опционально, если известен)
      t.references :client, foreign_key: { to_table: :users }, null: true, index: true
      
      # Сумма в рублях (исходная)
      t.decimal :amount_rub, precision: 15, scale: 2, null: false
      
      # Валюта и сумма конвертации
      t.string :target_currency, null: false # 'USD', 'THB'
      t.decimal :amount_foreign, precision: 15, scale: 2, null: false
      
      # Примененный курс
      t.decimal :exchange_rate, precision: 10, scale: 4, null: false
      
      # Комиссия системы (3%)
      t.decimal :commission_rub, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :commission_percentage, precision: 5, scale: 2, default: 3.0, null: false
      
      # Статус (🔧 ИСПРАВЛЕНИЕ БАГА - правильные статусы)
      t.integer :status, default: 0, null: false # 0=pending, 1=processing, 2=completed, 3=declined, 4=failed
      
      # Платежная система
      t.string :payment_method # 'sbp', 'card', 'qr', 'crypto'
      t.string :payment_id # ID платежа из внешней системы
      
      # QR-код (если использовался)
      t.string :qr_code_token
      
      # Платежная форма (если использовалась)
      t.references :payment_form, foreign_key: true, null: true, index: true
      
      # Метаданные
      t.text :description
      t.jsonb :metadata, default: {}
      
      t.timestamps
    end
    
    add_index :transactions, :status
    add_index :transactions, :qr_code_token, unique: true
    add_index :transactions, :payment_id
    add_index :transactions, :created_at
  end
end

