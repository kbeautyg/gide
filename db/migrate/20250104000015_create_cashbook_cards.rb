class CreateCashbookCards < ActiveRecord::Migration[7.1]
  def change
    create_table :cashbook_cards do |t|
      # Клиент-владелец карты
      t.references :client, foreign_key: { to_table: :users }, null: false, index: { unique: true }
      
      # Основной баланс
      t.decimal :balance, precision: 15, scale: 2, default: 0.0, null: false
      
      # Бонусный баланс (кэшбэк)
      t.decimal :bonus_balance, precision: 15, scale: 2, default: 0.0, null: false
      
      # Статистика
      t.decimal :total_spent, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :total_topped_up, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :total_cashback_earned, precision: 15, scale: 2, default: 0.0, null: false
      
      # Уникальный номер карты
      t.string :card_number, null: false
      
      # Статус
      t.boolean :active, default: true, null: false
      t.boolean :blocked, default: false, null: false
      t.text :block_reason
      
      t.timestamps
    end
    
    add_index :cashbook_cards, :card_number, unique: true
  end
end

