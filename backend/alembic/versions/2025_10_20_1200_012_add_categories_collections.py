"""Add categories and collections tables

Revision ID: 012_add_categories
Revises: 011
Create Date: 2025-10-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '012_add_categories'
down_revision = '011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаем таблицу categories
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.Column('seo_title', sa.String(), nullable=True),
        sa.Column('seo_description', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True, default=0),
        sa.Column('is_featured', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('views_count', sa.Integer(), nullable=True, default=0),
        sa.Column('clicks_count', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=True)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)
    op.create_index(op.f('ix_categories_type'), 'categories', ['type'], unique=False)

    # Создаем таблицу collections
    op.create_table(
        'collections',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cover_image', sa.String(), nullable=True),
        sa.Column('tour_ids', sa.JSON(), nullable=True),
        sa.Column('is_automatic', sa.Boolean(), nullable=True, default=False),
        sa.Column('auto_filters', sa.JSON(), nullable=True),
        sa.Column('auto_limit', sa.Integer(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True, default=0),
        sa.Column('is_featured', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('seo_title', sa.String(), nullable=True),
        sa.Column('seo_description', sa.Text(), nullable=True),
        sa.Column('views_count', sa.Integer(), nullable=True, default=0),
        sa.Column('clicks_count', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_collections_id'), 'collections', ['id'], unique=False)
    op.create_index(op.f('ix_collections_slug'), 'collections', ['slug'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_collections_slug'), table_name='collections')
    op.drop_index(op.f('ix_collections_id'), table_name='collections')
    op.drop_table('collections')
    
    op.drop_index(op.f('ix_categories_type'), table_name='categories')
    op.drop_index(op.f('ix_categories_slug'), table_name='categories')
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')


