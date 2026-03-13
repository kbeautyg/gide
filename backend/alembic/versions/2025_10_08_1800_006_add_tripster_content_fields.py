"""
add tripster content fields and tables
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_add_tripster_content'
down_revision = '005_add_tour_is_public'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем новые поля в таблицу tours
    op.add_column('tours', sa.Column('what_to_expect', sa.Text(), nullable=True))
    op.add_column('tours', sa.Column('organizational_details', sa.Text(), nullable=True))
    op.add_column('tours', sa.Column('included', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('not_included', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('meeting_point', sa.String(), nullable=True))
    op.add_column('tours', sa.Column('languages', sa.JSON(), nullable=True, server_default='["русский"]'))
    op.add_column('tours', sa.Column('max_group_size', sa.Integer(), nullable=True))
    op.add_column('tours', sa.Column('min_age', sa.Integer(), nullable=True))
    op.add_column('tours', sa.Column('difficulty_level', sa.String(), nullable=True))
    op.add_column('tours', sa.Column('landmarks', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('tags', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('themes', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('formats', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('tours', sa.Column('seo_title', sa.String(), nullable=True))
    op.add_column('tours', sa.Column('seo_description', sa.Text(), nullable=True))
    op.add_column('tours', sa.Column('long_description', sa.Text(), nullable=True))
    op.add_column('tours', sa.Column('total_bookings', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('tours', sa.Column('views_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('tours', sa.Column('has_discount', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('tours', sa.Column('is_new', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('tours', sa.Column('discount_percentage', sa.Integer(), nullable=True))
    op.add_column('tours', sa.Column('original_price', sa.Float(), nullable=True))
    
    # Убираем server_default после создания
    op.alter_column('tours', 'included', server_default=None)
    op.alter_column('tours', 'not_included', server_default=None)
    op.alter_column('tours', 'languages', server_default=None)
    op.alter_column('tours', 'landmarks', server_default=None)
    op.alter_column('tours', 'tags', server_default=None)
    op.alter_column('tours', 'themes', server_default=None)
    op.alter_column('tours', 'formats', server_default=None)
    op.alter_column('tours', 'total_bookings', server_default=None)
    op.alter_column('tours', 'views_count', server_default=None)
    op.alter_column('tours', 'has_discount', server_default=None)
    op.alter_column('tours', 'is_new', server_default=None)

    # Создаём таблицу destinations
    op.create_table(
        'destinations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('country', sa.String(), nullable=False),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.Column('tours_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('seo_text', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_destinations_name', 'destinations', ['name'])
    op.create_index('ix_destinations_country', 'destinations', ['country'])
    
    # Создаём таблицу landmarks
    op.create_table(
        'landmarks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('destination_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.Column('tours_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['destination_id'], ['destinations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_landmarks_destination_id', 'landmarks', ['destination_id'])
    
    # Создаём таблицу reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('tour_id', sa.String(), nullable=False),  # Исправлено на String
        sa.Column('user_name', sa.String(), nullable=False),
        sa.Column('user_photo', sa.String(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('experience_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['tour_id'], ['tours.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_reviews_tour_id', 'reviews', ['tour_id'])
    op.create_index('ix_reviews_rating', 'reviews', ['rating'])


def downgrade() -> None:
    # Удаляем таблицы
    op.drop_table('reviews')
    op.drop_table('landmarks')
    op.drop_table('destinations')
    
    # Удаляем поля из tours
    op.drop_column('tours', 'original_price')
    op.drop_column('tours', 'discount_percentage')
    op.drop_column('tours', 'is_new')
    op.drop_column('tours', 'has_discount')
    op.drop_column('tours', 'views_count')
    op.drop_column('tours', 'total_bookings')
    op.drop_column('tours', 'long_description')
    op.drop_column('tours', 'seo_description')
    op.drop_column('tours', 'seo_title')
    op.drop_column('tours', 'formats')
    op.drop_column('tours', 'themes')
    op.drop_column('tours', 'tags')
    op.drop_column('tours', 'landmarks')
    op.drop_column('tours', 'difficulty_level')
    op.drop_column('tours', 'min_age')
    op.drop_column('tours', 'max_group_size')
    op.drop_column('tours', 'languages')
    op.drop_column('tours', 'meeting_point')
    op.drop_column('tours', 'not_included')
    op.drop_column('tours', 'included')
    op.drop_column('tours', 'organizational_details')
    op.drop_column('tours', 'what_to_expect')

