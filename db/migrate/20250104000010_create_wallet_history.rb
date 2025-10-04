class CreateWalletHistory < ActiveRecord::Migration[7.1]
  def change
    create_table :wallet_histories do |t|
      # Пользователь
      t.references :user, foreign_key: true, null: false, index: true
      
      # Старый и новый адреса
      t.string :old_address
      t.string :new_address, null: false
      
      # Причина изменения
      t.text :reason
      
      # Кто изменил
      t.references :changed_by, foreign_key: { to_table: :users }, null: true
      
      # IP адрес для безопасности
      t.string :ip_address
      
      # Тип действия
      t.string :action, null: false, default: 'create' # create, update, delete
      
      t.timestamps
    end
    
    add_index :wallet_histories, :created_at
  end
end

