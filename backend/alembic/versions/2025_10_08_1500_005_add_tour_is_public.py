"""
add is_public flag to tours
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_10_08_1500_005_add_tour_is_public'
down_revision = '2025_10_07_1200_004_add_tour_share_code'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tours', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column('tours', 'is_public', server_default=None)


def downgrade() -> None:
    op.drop_column('tours', 'is_public')
