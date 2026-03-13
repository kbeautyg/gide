"""add tour archived and client data

Revision ID: 009
Revises: 008
Create Date: 2025-10-14 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поле is_archived для архивации туров
    op.add_column('tours', sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'))
    
    # Добавляем поля данных клиента для кастомных туров
    op.add_column('tours', sa.Column('client_name', sa.String(), nullable=True))
    op.add_column('tours', sa.Column('client_phone', sa.String(), nullable=True))
    op.add_column('tours', sa.Column('client_email', sa.String(), nullable=True))


def downgrade() -> None:
    # Удаляем поля данных клиента
    op.drop_column('tours', 'client_email')
    op.drop_column('tours', 'client_phone')
    op.drop_column('tours', 'client_name')
    
    # Удаляем поле is_archived
    op.drop_column('tours', 'is_archived')

