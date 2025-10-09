"""
add guide schedule and request duration
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2025_10_09_0000_007_add_guide_schedule_and_request_duration'
down_revision = '2025_10_08_1800_006_add_tripster_content_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавить поля в таблицу requests
    op.add_column('requests', sa.Column('duration_hours', sa.Integer(), nullable=False, server_default='2'))
    op.add_column('requests', sa.Column('assigned_date', sa.Date(), nullable=True))
    op.add_column('requests', sa.Column('guide_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    
    # Создать индексы
    op.create_index('ix_requests_guide_id', 'requests', ['guide_id'])
    op.create_index('ix_requests_assigned_date', 'requests', ['assigned_date'])
    
    # Убрать server_default
    op.alter_column('requests', 'duration_hours', server_default=None)
    
    # Создать таблицу guide_schedules
    op.create_table(
        'guide_schedules',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('guide_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('booked_hours', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('guide_id', 'date', name='uix_guide_date')
    )
    
    # Создать индексы для guide_schedules
    op.create_index('ix_guide_schedules_guide_id', 'guide_schedules', ['guide_id'])
    op.create_index('ix_guide_schedules_date', 'guide_schedules', ['date'])
    op.create_index('ix_guide_schedules_guide_date', 'guide_schedules', ['guide_id', 'date'])
    
    # Убрать server_default
    op.alter_column('guide_schedules', 'booked_hours', server_default=None)


def downgrade() -> None:
    # Удалить таблицу guide_schedules
    op.drop_table('guide_schedules')
    
    # Удалить индексы
    op.drop_index('ix_requests_assigned_date', 'requests')
    op.drop_index('ix_requests_guide_id', 'requests')
    
    # Удалить поля из requests
    op.drop_column('requests', 'guide_id')
    op.drop_column('requests', 'assigned_date')
    op.drop_column('requests', 'duration_hours')

