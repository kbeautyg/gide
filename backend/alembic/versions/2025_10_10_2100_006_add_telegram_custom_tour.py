"""add telegram and custom tour fields

Revision ID: 006
Revises: 005
Create Date: 2025-10-10 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Add telegram_username to bookings
    op.add_column('bookings', sa.Column('telegram_username', sa.String(), nullable=True))
    op.add_column('bookings', sa.Column('request_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_bookings_request_id', 'bookings', 'requests', ['request_id'], ['id'])

    # Add telegram_username and booking/tour links to requests
    op.add_column('requests', sa.Column('telegram_username', sa.String(), nullable=True))
    op.add_column('requests', sa.Column('booking_id', sa.Integer(), nullable=True))
    op.add_column('requests', sa.Column('generated_tour_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_requests_booking_id', 'requests', 'bookings', ['booking_id'], ['id'])
    op.create_foreign_key('fk_requests_generated_tour_id', 'requests', 'tours', ['generated_tour_id'], ['id'])

    # Add is_custom and request_id to tours
    op.add_column('tours', sa.Column('is_custom', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tours', sa.Column('request_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_tours_request_id', 'tours', 'requests', ['request_id'], ['id'])


def downgrade():
    # Drop tours columns
    op.drop_constraint('fk_tours_request_id', 'tours', type_='foreignkey')
    op.drop_column('tours', 'request_id')
    op.drop_column('tours', 'is_custom')

    # Drop requests columns
    op.drop_constraint('fk_requests_generated_tour_id', 'requests', type_='foreignkey')
    op.drop_constraint('fk_requests_booking_id', 'requests', type_='foreignkey')
    op.drop_column('requests', 'generated_tour_id')
    op.drop_column('requests', 'booking_id')
    op.drop_column('requests', 'telegram_username')

    # Drop bookings columns
    op.drop_constraint('fk_bookings_request_id', 'bookings', type_='foreignkey')
    op.drop_column('bookings', 'request_id')
    op.drop_column('bookings', 'telegram_username')

