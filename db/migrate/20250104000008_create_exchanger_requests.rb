class CreateExchangerRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :exchanger_requests do |t|
      # Обменник, которому назначена заявка
      t.references :exchanger, foreign_key: { to_table: :users }, null: false, index: true
      
      # Супер-админ, который создал общую заявку
      t.references :created_by, foreign_key: { to_table: :users }, null: false
      
      # Общая сумма в рублях (сумма всех withdrawal_requests)
      t.decimal :total_amount_rub, precision: 15, scale: 2, null: false
      
      # Общая сумма в USDT
      t.decimal :total_amount_usd, precision: 15, scale: 2, null: false
      
      # Количество включенных заявок админов
      t.integer :requests_count, default: 0, null: false
      
      # Статус
      t.integer :status, default: 0, null: false # 0=pending, 1=in_progress, 2=completed
      
      # Долг перед обменником
      t.decimal :debt_remaining, precision: 15, scale: 2, default: 0.0, null: false
      
      # Даты
      t.datetime :completed_at
      t.datetime :paid_at
      
      # Примечания
      t.text :notes
      
      t.timestamps
    end
    
    add_index :exchanger_requests, :status
    add_index :exchanger_requests, [:exchanger_id, :status]
  end
end

