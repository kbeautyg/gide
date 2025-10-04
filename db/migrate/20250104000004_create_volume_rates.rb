class CreateVolumeRates < ActiveRecord::Migration[7.1]
  def change
    create_table :volume_rates do |t|
      # Порог в рублях
      t.decimal :threshold_rub, precision: 15, scale: 2, null: false
      
      # Курсы при достижении порога
      t.decimal :rub_to_usd, precision: 10, scale: 4, null: false
      t.decimal :rub_to_thb, precision: 10, scale: 4, null: false
      
      # Кто создал
      t.references :created_by, foreign_key: { to_table: :users }, null: false
      
      # Область применения (null = глобальный)
      t.references :scope_user, foreign_key: { to_table: :users }, null: true, index: true
      
      # Флаг активности
      t.boolean :active, default: true, null: false
      
      t.timestamps
    end
    
    add_index :volume_rates, [:active, :scope_user_id, :threshold_rub]
  end
end

