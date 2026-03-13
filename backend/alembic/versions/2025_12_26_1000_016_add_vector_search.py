"""add_vector_search

Revision ID: 016
Revises: 015
Create Date: 2025-12-26 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = '016'
down_revision = '015'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Enable pgvector extension safely
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    except Exception as e:
        print(f"WARNING: Could not create vector extension: {e}")
        return

    # 2. Add embedding column to tours table
    # Using 1536 dimensions (standard for OpenAI text-embedding-3-small)
    try:
        op.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS embedding vector(1536)")
    except Exception as e:
        print(f"WARNING: Could not add embedding column: {e}")
        return

    # 3. Create index for faster search (IVFFlat is good for starters)
    try:
        op.execute("""
            CREATE INDEX IF NOT EXISTS idx_tours_embedding 
            ON tours 
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100)
        """)
    except Exception as e:
        print(f"WARNING: Could not create vector index: {e}")

def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_tours_embedding")
    op.execute("ALTER TABLE tours DROP COLUMN IF EXISTS embedding")
    # We typically don't drop the extension in downgrade as other tables might use it










