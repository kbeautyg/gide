"""Initial schema - users, tours, bookings

Revision ID: 001
Revises: 
Create Date: 2025-10-05 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаем enum для ролей
    user_role_enum = postgresql.ENUM(
        'super_admin', 'admin', 'super_manager', 'manager', 'guide', 'client', 'exchanger',
        name='userrole'
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    # Создаем таблицу пользователей
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('parent_id', sa.String(), nullable=True),
        sa.Column('balance_rub', sa.Float(), nullable=True, default=0.0),
        sa.Column('balance_usd', sa.Float(), nullable=True, default=0.0),
        sa.Column('balance_thb', sa.Float(), nullable=True, default=0.0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parent_id'], ['users.id'], ),
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_phone', 'users', ['phone'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    
    # Создаем таблицу экскурсий
    op.create_table(
        'tours',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('guide_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('photos', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True, default=0.0),
        sa.Column('reviews_count', sa.Integer(), nullable=True, default=0),
        sa.Column('active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['guide_id'], ['users.id'], ),
    )
    op.create_index('ix_tours_id', 'tours', ['id'])
    
    # Создаем enum для статусов бронирования
    booking_status_enum = postgresql.ENUM(
        'pending', 'confirmed', 'cancelled', 'completed',
        name='bookingstatus'
    )
    booking_status_enum.create(op.get_bind(), checkfirst=True)
    
    payment_status_enum = postgresql.ENUM(
        'awaiting_payment', 'paid', 'refunded',
        name='paymentstatus'
    )
    payment_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Создаем таблицу бронирований
    op.create_table(
        'bookings',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('tour_id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('participants_count', sa.Integer(), nullable=False),
        sa.Column('total_price', sa.Float(), nullable=False),
        sa.Column('status', booking_status_enum, nullable=True),
        sa.Column('payment_status', payment_status_enum, nullable=True),
        sa.Column('client_name', sa.String(), nullable=False),
        sa.Column('client_phone', sa.String(), nullable=False),
        sa.Column('client_email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tour_id'], ['tours.id'], ),
        sa.ForeignKeyConstraint(['client_id'], ['users.id'], ),
    )
    op.create_index('ix_bookings_id', 'bookings', ['id'])


def downgrade() -> None:
    op.drop_index('ix_bookings_id', table_name='bookings')
    op.drop_table('bookings')
    
    op.execute('DROP TYPE IF EXISTS bookingstatus')
    op.execute('DROP TYPE IF EXISTS paymentstatus')
    
    op.drop_index('ix_tours_id', table_name='tours')
    op.drop_table('tours')
    
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
    
    op.execute('DROP TYPE IF EXISTS userrole')
