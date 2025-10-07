"""add tour unique_code

Revision ID: 004
Revises: 002
Create Date: 2025-10-07 21:00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Проверяем существует ли колонка
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('tours')]
    
    if 'unique_code' not in columns:
        # Добавляем колонку unique_code
        op.add_column('tours', sa.Column('unique_code', sa.String(), nullable=True))
        
        # Генерируем уникальные коды для существующих экскурсий
        conn.execute(sa.text("""
            UPDATE tours 
            SET unique_code = LOWER(SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 12))
            WHERE unique_code IS NULL
        """))
        
        # Делаем колонку NOT NULL и добавляем индекс
        op.alter_column('tours', 'unique_code', nullable=False)
        op.create_unique_constraint('uq_tours_unique_code', 'tours', ['unique_code'])
        op.create_index('ix_tours_unique_code', 'tours', ['unique_code'])


def downgrade():
    op.drop_index('ix_tours_unique_code', table_name='tours')
    op.drop_constraint('uq_tours_unique_code', 'tours', type_='unique')
    op.drop_column('tours', 'unique_code')
