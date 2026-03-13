"""Add guide status to users

Revision ID: 002
Revises: 001
Create Date: 2026-02-06 00:00:00.000000

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
    # 1. Создаем тип ENUM для статуса заявки
    # Используем безопасное создание (если уже есть - не ошибка)
    op.execute("DO $$ BEGIN CREATE TYPE guidestatus AS ENUM ('none', 'pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    
    guide_status_enum = postgresql.ENUM(
        'none', 'pending', 'approved', 'rejected',
        name='guidestatus',
        create_type=False
    )

    # 2. Добавляем колонку в таблицу users
    # Сначала пытаемся добавить с дефолтным значением 'none'
    op.add_column('users', sa.Column('guide_status', guide_status_enum, server_default='none', nullable=False))


def downgrade() -> None:
    # Удаляем колонку
    op.drop_column('users', 'guide_status')
    
    # Удаляем тип (опционально, если больше нигде не используется)
    op.execute('DROP TYPE IF EXISTS guidestatus')
