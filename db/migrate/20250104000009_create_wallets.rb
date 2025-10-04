class CreateWallets < ActiveRecord::Migration[7.1]
  def change
    create_table :wallets do |t|
      # Пользователь (обычно админ)
      t.references :user, foreign_key: true, null: false, index: true
      
      # Адрес кошелька TRC20
      t.string :address, null: false
      
      # Верификация
      t.boolean :verified, default: false, null: false
      t.datetime :verified_at
      t.references :verified_by, foreign_key: { to_table: :users }, null: true
      
      # Статус
      t.boolean :active, default: true, null: false
      
      # Метаданные
      t.string :label # Метка для удобства (например, "Основной кошелек")
      
      t.timestamps
    end
    
    add_index :wallets, :address
    add_index :wallets, [:user_id, :active]
  end
end

