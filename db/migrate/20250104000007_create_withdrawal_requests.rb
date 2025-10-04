class CreateWithdrawalRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :withdrawal_requests do |t|
      # Админ, который создал заявку
      t.references :admin, foreign_key: { to_table: :users }, null: false, index: true
      
      # Сумма в рублях
      t.decimal :amount_rub, precision: 15, scale: 2, null: false
      
      # Сумма в USDT (после конвертации)
      t.decimal :amount_usd, precision: 15, scale: 2, null: false
      
      # Курс конвертации (с учетом комиссии обменника +0.2%)
      t.decimal :exchange_rate, precision: 10, scale: 4, null: false
      
      # Комиссия системы (3%)
      t.decimal :commission_rub, precision: 15, scale: 2, null: false
      t.decimal :service_commission_rub, precision: 15, scale: 2, null: false # 2.8%
      t.decimal :exchanger_commission_rub, precision: 15, scale: 2, null: false # 0.2%
      
      # Кошелек TRC20
      t.string :wallet_trc20, null: false
      
      # Статус
      t.integer :status, default: 0, null: false # 0=pending, 1=approved, 2=in_progress, 3=completed, 4=rejected
      
      # Кто обработал
      t.references :processed_by, foreign_key: { to_table: :users }, null: true
      t.datetime :processed_at
      
      # Связь с общей заявкой обменника
      t.references :exchanger_request, foreign_key: true, null: true, index: true
      
      # Примечания
      t.text :admin_notes
      t.text :rejection_reason
      
      t.timestamps
    end
    
    add_index :withdrawal_requests, :status
    add_index :withdrawal_requests, :wallet_trc20
  end
end

