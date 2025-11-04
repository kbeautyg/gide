"""add parent_id to categories

Revision ID: 013_add_category_parent_id
Revises: 012_add_categories_collections
Create Date: 2025-11-04 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '013_add_category_parent_id'
down_revision = '012_add_categories_collections'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поле parent_id для создания иерархии категорий
    op.add_column('categories', sa.Column('parent_id', sa.Integer(), nullable=True))
    
    # Добавляем внешний ключ на саму таблицу categories
    op.create_foreign_key(
        'fk_categories_parent_id',
        'categories', 'categories',
        ['parent_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Добавляем индекс для быстрого поиска по parent_id
    op.create_index('ix_categories_parent_id', 'categories', ['parent_id'])


def downgrade() -> None:
    # Удаляем индекс
    op.drop_index('ix_categories_parent_id', table_name='categories')
    
    # Удаляем внешний ключ
    op.drop_constraint('fk_categories_parent_id', 'categories', type_='foreignkey')
    
    # Удаляем поле
    op.drop_column('categories', 'parent_id')

