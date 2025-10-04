class CreateSimpleMvpSchema < ActiveRecord::Migration[7.1]
  def change
    # Создаем пользователей
    create_table :users do |t|
      # Devise fields
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at

      # Custom fields
      t.string :phone, null: false
      t.string :full_name
      t.integer :role, default: 2, null: false # 0=admin, 1=manager, 2=client
      
      # Иерархия пользователей (self-referencing)
      t.references :parent, foreign_key: { to_table: :users }, null: true, index: true
      
      # Статус
      t.boolean :active, default: true, null: false
      
      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :phone, unique: true
    add_index :users, :reset_password_token, unique: true
    
    # Простая таблица платежных ссылок
    create_table :payment_links do |t|
      t.references :manager, null: false, foreign_key: { to_table: :users }
      t.string :token, null: false, index: { unique: true }
      
      # Суммы
      t.decimal :amount_from, precision: 15, scale: 2, null: false
      t.decimal :amount_to, precision: 15, scale: 2, null: false
      t.decimal :rate, precision: 10, scale: 4, null: false
      
      # Валюты (0=rub, 1=thb, 2=usd)
      t.integer :currency_from, default: 0, null: false
      t.integer :currency_to, default: 1, null: false
      
      # Статус (0=active, 1=completed, 2=expired)
      t.integer :status, default: 0, null: false
      
      # Метаданные
      t.string :client_name
      t.string :client_phone
      t.text :note
      
      # Даты
      t.datetime :paid_at
      t.datetime :expires_at
      
      t.timestamps
    end
    
    # Упрощаем транзакции
    create_table :transactions do |t|
      t.references :manager, null: false, foreign_key: { to_table: :users }
      t.references :client, foreign_key: { to_table: :users }
      t.references :payment_link, foreign_key: true
      
      # Суммы
      t.decimal :amount_from, precision: 15, scale: 2, null: false
      t.decimal :amount_to, precision: 15, scale: 2, null: false
      t.decimal :rate, precision: 10, scale: 4, null: false
      
      # Валюты
      t.integer :currency_from, default: 0, null: false
      t.integer :currency_to, default: 1, null: false
      
      # Статус (0=pending, 1=completed, 2=failed)
      t.integer :status, default: 0, null: false
      
      # Комиссия менеджера
      t.decimal :commission_amount, precision: 15, scale: 2, default: 0
      t.decimal :commission_percent, precision: 5, scale: 2, default: 0
      
      # Метаданные
      t.string :client_name
      t.string :client_phone
      t.text :note
      
      t.timestamps
    end
    
    # Курсы валют (фиксированные)
    create_table :exchange_rates do |t|
      t.decimal :rub_to_thb, precision: 10, scale: 4, default: 0.37
      t.decimal :rub_to_usd, precision: 10, scale: 4, default: 0.011
      t.decimal :thb_to_rub, precision: 10, scale: 4, default: 2.7
      t.decimal :usd_to_rub, precision: 10, scale: 4, default: 91.0
      
      t.boolean :active, default: true
      t.timestamps
    end
    
    # Балансы пользователей
    create_table :balances do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      
      t.decimal :rub_balance, precision: 15, scale: 2, default: 0
      t.decimal :thb_balance, precision: 15, scale: 2, default: 0
      t.decimal :usd_balance, precision: 15, scale: 2, default: 0
      
      t.decimal :rub_debt, precision: 15, scale: 2, default: 0
      t.decimal :thb_debt, precision: 15, scale: 2, default: 0
      t.decimal :usd_debt, precision: 15, scale: 2, default: 0
      
      t.timestamps
    end
  end
end
