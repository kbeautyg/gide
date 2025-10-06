"""Add tour date range and requests table

Revision ID: 002
Revises: 001
Create Date: 2025-10-05 03:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поля дат начала и окончания для экскурсий
    op.add_column('tours', sa.Column('start_date', sa.Date(), nullable=True))
    op.add_column('tours', sa.Column('end_date', sa.Date(), nullable=True))
    
    # Создаем enum для статусов заявок
    request_status_enum = postgresql.ENUM(
        'pending', 'in_progress', 'completed', 'cancelled',
        name='requeststatus'
    )
    request_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Создаем таблицу заявок клиентов
    op.create_table(
        'requests',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('preferred_date', sa.Date(), nullable=True),
        sa.Column('participants_count', sa.Integer(), nullable=False),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('status', request_status_enum, nullable=True, default='pending'),
        sa.Column('assigned_to', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['client_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
    )
    op.create_index('ix_requests_id', 'requests', ['id'])


def downgrade() -> None:
    op.drop_index('ix_requests_id', table_name='requests')
    op.drop_table('requests')
    
    op.execute('DROP TYPE IF EXISTS requeststatus')
    
    op.drop_column('tours', 'end_date')
    op.drop_column('tours', 'start_date')
