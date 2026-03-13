"""add booking time

Revision ID: 010
Revises: 009
Create Date: 2025-10-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поле time для времени экскурсии
    op.add_column('bookings', sa.Column('time', sa.String(), nullable=True, server_default='10:00'))


def downgrade() -> None:
    # Удаляем поле time
    op.drop_column('bookings', 'time')

