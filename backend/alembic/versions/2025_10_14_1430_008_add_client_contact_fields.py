"""add_client_contact_fields

Revision ID: 008_add_client_contact
Revises: 2025_10_10_2100_006_add_telegram_custom_tour
Create Date: 2025-10-14 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поля контактов клиента в таблицу requests
    op.add_column('requests', sa.Column('client_name', sa.String(), nullable=True))
    op.add_column('requests', sa.Column('client_phone', sa.String(), nullable=True))
    op.add_column('requests', sa.Column('client_email', sa.String(), nullable=True))


def downgrade() -> None:
    # Удаляем поля контактов клиента
    op.drop_column('requests', 'client_email')
    op.drop_column('requests', 'client_phone')
    op.drop_column('requests', 'client_name')

