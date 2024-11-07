"""Initital migrations

Revision ID: 939f88a54bfe
Revises: 
Create Date: 2024-10-07 21:46:47.841171

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '939f88a54bfe'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('acc_models',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_acc_models_name'), 'acc_models', ['name'], unique=False)
    op.create_table('attributes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attributes_name'), 'attributes', ['name'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('designation', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('components',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('acc_model_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['acc_model_id'], ['acc_models.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_components_name'), 'components', ['name'], unique=False)
    op.create_table('capabilities',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('component_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['component_id'], ['components.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_capabilities_name'), 'capabilities', ['name'], unique=False)
    op.create_table('capability_assessments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('capability_id', sa.Integer(), nullable=False),
    sa.Column('attribute_id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=True),
    sa.Column('comments', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['attribute_id'], ['attributes.id'], ),
    sa.ForeignKeyConstraint(['capability_id'], ['capabilities.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('ratings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.String(), nullable=False),
    sa.Column('comments', sa.Text(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('capability_assessment_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['capability_assessment_id'], ['capability_assessments.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ratings_id'), 'ratings', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_ratings_id'), table_name='ratings')
    op.drop_table('ratings')
    op.drop_table('capability_assessments')
    op.drop_index(op.f('ix_capabilities_name'), table_name='capabilities')
    op.drop_table('capabilities')
    op.drop_index(op.f('ix_components_name'), table_name='components')
    op.drop_table('components')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_attributes_name'), table_name='attributes')
    op.drop_table('attributes')
    op.drop_index(op.f('ix_acc_models_name'), table_name='acc_models')
    op.drop_table('acc_models')
    # ### end Alembic commands ###