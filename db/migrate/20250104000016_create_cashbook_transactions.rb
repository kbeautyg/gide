class CreateCashbookTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :cashbook_transactions do |t|
      # Кэшбук-карта
      t.references :cashbook_card, foreign_key: true, null: false, index: true
      
      # Сумма (положительная для пополнения, отрицательная для списания)
      t.decimal :amount, precision: 15, scale: 2, null: false
      
      # Тип операции
      t.integer :transaction_type, null: false, default: 0 
      # 0=top_up, 1=payment, 2=cashback, 3=refund, 4=adjustment
      
      # Описание
      t.text :description
      
      # Связь с бронированием (если это оплата экскурсии)
      t.references :booking, foreign_key: true, null: true
      
      # Баланс после операции (для истории)
      t.decimal :balance_after, precision: 15, scale: 2, null: false
      
      # Метаданные
      t.jsonb :metadata, default: {}
      
      t.timestamps
    end
    
    add_index :cashbook_transactions, [:cashbook_card_id, :created_at]
    add_index :cashbook_transactions, :transaction_type
  end
end

