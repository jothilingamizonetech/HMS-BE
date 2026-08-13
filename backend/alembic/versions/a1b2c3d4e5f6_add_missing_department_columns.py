# add missing department columns
# Revision ID: a1b2c3d4e5f6
# Revises: 9c3e1f6a4b2d
# Create Date: 2026-08-13 16:37:00.000000

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9c3e1f6a4b2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    is_sqlite = conn.dialect.name == 'sqlite'

    def add_col_safe(table_name: str, col_name: str, col_type: str) -> None:
        if is_sqlite:
            insp = sa.inspect(conn)
            columns = [c['name'] for c in insp.get_columns(table_name)]
            if col_name not in columns:
                op.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}")
        else:
            try:
                with conn.begin_nested():
                    op.execute(f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
            except Exception:
                pass

    # 1. Add missing columns to departments table
    department_cols = [
        ('head_of_department', 'VARCHAR(150)'),
        ('email', 'VARCHAR(150)'),
        ('phone', 'VARCHAR(50)'),
        ('floor_location', 'VARCHAR(100)'),
        ('bed_count', 'INTEGER DEFAULT 0'),
        ('status', "VARCHAR(20) DEFAULT 'Active'"),
        ('branch', 'VARCHAR(200)'),
    ]
    for col_name, col_type in department_cols:
        add_col_safe('departments', col_name, col_type)

    # 2. Add missing columns to branches table
    branch_cols = [
        ('total_staff', 'INTEGER DEFAULT 0'),
        ('bed_capacity', 'INTEGER DEFAULT 0'),
        ('email', 'VARCHAR(150)'),
        ('phone', 'VARCHAR(50)'),
        ('status', "VARCHAR(20) DEFAULT 'Active'"),
        ('is_main_branch', 'BOOLEAN DEFAULT FALSE'),
    ]
    for col_name, col_type in branch_cols:
        add_col_safe('branches', col_name, col_type)

    # 3. Add missing columns to doctors table
    doctor_cols = [
        ('branch', 'VARCHAR(200)'),
    ]
    for col_name, col_type in doctor_cols:
        add_col_safe('doctors', col_name, col_type)


def downgrade() -> None:
    pass
