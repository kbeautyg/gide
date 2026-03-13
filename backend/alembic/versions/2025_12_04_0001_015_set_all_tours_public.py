"""Set all tours is_public=True

Revision ID: 015
Revises: 014
Create Date: 2025-12-04 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '015'
down_revision = '014'
branch_labels = None
depends_on = None


def upgrade():
    # Обновляем все туры: ставим is_public = True
    op.execute("UPDATE tours SET is_public = TRUE WHERE is_public = FALSE OR is_public IS NULL")


def downgrade():
    # Откатываем: ставим is_public = False
    op.execute("UPDATE tours SET is_public = FALSE")

