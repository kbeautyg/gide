class CreateBalances < ActiveRecord::Migration[7.1]
  def change
    create_table :balances do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      
      # Балансы в разных валютах (используем decimal для точности)
      t.decimal :balance_rub, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :balance_usd, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :balance_thb, precision: 15, scale: 2, default: 0.0, null: false
      
      # Замороженные средства (при создании заявок на вывод)
      t.decimal :frozen_rub, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :frozen_usd, precision: 15, scale: 2, default: 0.0, null: false
      
      # Статистика
      t.decimal :total_earned, precision: 15, scale: 2, default: 0.0, null: false
      t.decimal :total_withdrawn, precision: 15, scale: 2, default: 0.0, null: false
      
      t.timestamps
    end
  end
end

