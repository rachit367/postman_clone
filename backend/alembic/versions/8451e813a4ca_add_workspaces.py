"""add workspaces

Revision ID: 8451e813a4ca
Revises: 39187f55bfc1
Create Date: 2026-06-25 16:07:36.631321

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8451e813a4ca'
down_revision: Union[str, None] = '39187f55bfc1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'workspaces',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    for table in ('collections', 'environments', 'history'):
        with op.batch_alter_table(table) as batch:
            batch.add_column(sa.Column('workspace_id', sa.Integer(), nullable=False))
            batch.create_foreign_key(
                f'fk_{table}_workspace_id',
                'workspaces',
                ['workspace_id'],
                ['id'],
                ondelete='CASCADE',
            )


def downgrade() -> None:
    for table in ('history', 'environments', 'collections'):
        with op.batch_alter_table(table) as batch:
            batch.drop_constraint(f'fk_{table}_workspace_id', type_='foreignkey')
            batch.drop_column('workspace_id')
    op.drop_table('workspaces')
