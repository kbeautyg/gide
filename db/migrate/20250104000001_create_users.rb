class CreateUsers < ActiveRecord::Migration[7.1]
  def change
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
      t.integer :role, default: 5, null: false # 0=super_admin, 1=admin, 2=super_manager, 3=manager, 4=exchanger, 5=client
      
      # Иерархия пользователей (self-referencing)
      t.references :parent, foreign_key: { to_table: :users }, null: true, index: true

      # Дополнительная информация
      t.string :telegram_id
      t.boolean :active, default: true, null: false
      t.string :invitation_code
      
      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :phone, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :role
    add_index :users, :invitation_code, unique: true
    add_index :users, :telegram_id, unique: true
  end
end

