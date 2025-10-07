"""add transactions table

Revision ID: 003
Revises: 002
Create Date: 2025-10-07 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    """Add transactions table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Проверяем, существует ли таблица
    if 'transactions' not in inspector.get_table_names():
        op.create_table(
            'transactions',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('type', sa.String(), nullable=False),
            sa.Column('amount_rub', sa.Float(), nullable=False),
            sa.Column('amount_usd', sa.Float(), server_default='0.0'),
            sa.Column('amount_thb', sa.Float(), server_default='0.0'),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('booking_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_transactions_id', 'transactions', ['id'])
        print("✅ Таблица transactions создана")
    else:
        print("⚠️ Таблица transactions уже существует")


def downgrade():
    """Remove transactions table"""
    op.drop_index('ix_transactions_id', table_name='transactions')
    op.drop_table('transactions')
