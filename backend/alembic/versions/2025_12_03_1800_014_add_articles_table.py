"""Add articles table

Revision ID: 014
Revises: 013
Create Date: 2025-12-03

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '014'
down_revision = '013_add_category_parent_id'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'articles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('preview_text', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.Column('read_time', sa.Integer(), default=5, nullable=True),
        sa.Column('country_tag', sa.String(), nullable=True),
        sa.Column('views_count', sa.Integer(), default=0, nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_articles_id'), 'articles', ['id'], unique=False)
    op.create_index(op.f('ix_articles_slug'), 'articles', ['slug'], unique=True)
    op.create_index(op.f('ix_articles_country_tag'), 'articles', ['country_tag'], unique=False)
    op.create_index(op.f('ix_articles_published_at'), 'articles', ['published_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_articles_published_at'), table_name='articles')
    op.drop_index(op.f('ix_articles_country_tag'), table_name='articles')
    op.drop_index(op.f('ix_articles_slug'), table_name='articles')
    op.drop_index(op.f('ix_articles_id'), table_name='articles')
    op.drop_table('articles')

