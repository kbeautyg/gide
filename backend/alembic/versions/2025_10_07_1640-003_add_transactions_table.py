"""Add transactions table

Revision ID: 003_add_transactions
Revises: 002_add_tour_date_range
Create Date: 2025-10-07 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_add_transactions'
down_revision: Union[str, None] = '002_add_tour_date_range'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Проверяем, существует ли таблица
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'transactions' not in inspector.get_table_names():
        # Создаем enum для типов транзакций
        op.execute("""
            DO $$ BEGIN
                CREATE TYPE transactiontype AS ENUM ('booking_payment', 'withdrawal', 'refund', 'admin_adjustment');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        # Создаем таблицу транзакций
        op.create_table(
            'transactions',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('type', sa.Enum('booking_payment', 'withdrawal', 'refund', 'admin_adjustment', name='transactiontype'), nullable=False),
            sa.Column('amount_rub', sa.Float(), nullable=False),
            sa.Column('amount_usd', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('amount_thb', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('booking_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
        print("✓ Created transactions table")
    else:
        print("✓ Transactions table already exists")


def downgrade() -> None:
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
    op.execute('DROP TYPE IF EXISTS transactiontype')
