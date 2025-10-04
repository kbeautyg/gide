namespace :db do
  desc "Setup database for Railway deployment"
  task setup_for_railway: :environment do
    puts "🔧 Dropping all tables..."
    
    # Удаляем все таблицы кроме schema_migrations и ar_internal_metadata
    tables = ActiveRecord::Base.connection.tables - ['schema_migrations', 'ar_internal_metadata']
    tables.each do |table|
      begin
        ActiveRecord::Base.connection.execute("DROP TABLE IF EXISTS #{table} CASCADE")
        puts "  ✅ Dropped table: #{table}"
      rescue => e
        puts "  ⚠️  Error dropping #{table}: #{e.message}"
      end
    end
    
    puts "\n📋 Loading schema..."
    Rake::Task['db:schema:load'].invoke
    
    puts "\n🌱 Running seeds..."
    Rake::Task['db:seed'].invoke
    
    puts "\n🎉 Database setup complete!"
  end
end

