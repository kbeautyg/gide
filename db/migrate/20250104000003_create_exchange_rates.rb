class CreateExchangeRates < ActiveRecord::Migration[7.1]
  def change
    create_table :exchange_rates do |t|
      # Базовые курсы
      t.decimal :rub_to_usd, precision: 10, scale: 4, null: false
      t.decimal :rub_to_thb, precision: 10, scale: 4, null: false
      t.decimal :usd_to_rub, precision: 10, scale: 4, null: false
      t.decimal :thb_to_rub, precision: 10, scale: 4, null: false
      
      # Кто установил курс
      t.references :created_by, foreign_key: { to_table: :users }, null: true
      
      # Область применения (null = глобальный)
      t.references :scope_user, foreign_key: { to_table: :users }, null: true, index: true
      
      # Флаг активности
      t.boolean :active, default: true, null: false
      
      # Источник курса (manual, rapira_api)
      t.string :source, default: 'manual', null: false
      
      t.timestamps
    end
    
    add_index :exchange_rates, [:active, :scope_user_id]
  end
end

