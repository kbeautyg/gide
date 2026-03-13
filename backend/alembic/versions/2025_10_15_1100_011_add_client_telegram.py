"""add client telegram to tours

Revision ID: 011
Revises: 010
Create Date: 2025-10-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поле client_telegram для сохранения Telegram клиента
    op.add_column('tours', sa.Column('client_telegram', sa.String(), nullable=True))


def downgrade() -> None:
    # Удаляем поле client_telegram
    op.drop_column('tours', 'client_telegram')

