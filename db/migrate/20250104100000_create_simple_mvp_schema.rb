class CreateSimpleMvpSchema < ActiveRecord::Migration[7.1]
  def change
    # ТОЛЬКО таблица пользователей
    create_table :users do |t|
      # Devise
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at

      # Наши поля
      t.string :phone, null: false
      t.string :full_name
      t.integer :role, default: 2, null: false # 0=admin, 1=manager, 2=client
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :phone, unique: true
    add_index :users, :reset_password_token, unique: true
  end
end