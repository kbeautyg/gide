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
    # Добавляем поля дат начала и окончания для экскурсий (с проверкой существования)
    from sqlalchemy import inspect
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('tours')]
    
    if 'start_date' not in columns:
        op.add_column('tours', sa.Column('start_date', sa.Date(), nullable=True))
    if 'end_date' not in columns:
        op.add_column('tours', sa.Column('end_date', sa.Date(), nullable=True))
    
    # Создаем таблицу заявок клиентов (с проверкой существования)
    tables = inspector.get_table_names()
    
    if 'requests' not in tables:
        op.create_table(
            'requests',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('client_id', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('preferred_date', sa.Date(), nullable=True),
            sa.Column('participants_count', sa.Integer(), nullable=False),
            sa.Column('budget', sa.Float(), nullable=True),
            sa.Column('location', sa.String(), nullable=True),
            sa.Column('status', sa.String(), nullable=True, default='pending'),
            sa.Column('assigned_to', sa.Integer(), nullable=True),
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
