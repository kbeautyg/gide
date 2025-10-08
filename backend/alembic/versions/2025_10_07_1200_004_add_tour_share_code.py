"""add tour share_code

Revision ID: 004
Revises: 002
Create Date: 2025-10-07 12:00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_10_07_1200_004_add_tour_share_code'
down_revision = '2025_10_05_0300-002_add_tour_date_range_and_requests'
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем колонку share_code
    op.add_column('tours', sa.Column('share_code', sa.String(length=8), nullable=True))
    op.create_index(op.f('ix_tours_share_code'), 'tours', ['share_code'], unique=True)
    
    # Генерируем уникальные коды для существующих экскурсий
    conn = op.get_bind()
    conn.execute(sa.text("""
        UPDATE tours 
        SET share_code = SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 8)
        WHERE share_code IS NULL
    """))


def downgrade():
    op.drop_index(op.f('ix_tours_share_code'), table_name='tours')
    op.drop_column('tours', 'share_code')
