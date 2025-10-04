class CreatePaymentForms < ActiveRecord::Migration[7.1]
  def change
    create_table :payment_forms do |t|
      # Менеджер-владелец формы
      t.references :manager, foreign_key: { to_table: :users }, null: false, index: true
      
      # Название формы (для идентификации)
      t.string :name, null: false
      
      # Фиксированная сумма в рублях
      t.decimal :amount_rub, precision: 15, scale: 2, null: false
      
      # Валюта конвертации
      t.string :target_currency, null: false, default: 'USD'
      
      # Фиксированный курс (или использовать текущий)
      t.decimal :fixed_rate, precision: 10, scale: 4, null: true
      t.boolean :use_current_rate, default: true, null: false
      
      # Ограничения
      t.integer :max_uses, default: 100, null: false
      t.integer :uses_count, default: 0, null: false
      
      # Срок действия
      t.datetime :expires_at, null: true
      
      # Уникальный токен для публичного доступа
      t.string :token, null: false
      
      # Статус
      t.boolean :active, default: true, null: false
      t.boolean :archived, default: false, null: false
      
      # Описание
      t.text :description
      
      t.timestamps
    end
    
    add_index :payment_forms, :token, unique: true
    add_index :payment_forms, [:manager_id, :active]
  end
end

