"""
Seperate schema into src package for import from different locations.
"""

from pathlib import Path
from ariadne import load_schema_from_path, make_executable_schema
from src.queries import queries

this_dir = Path(__file__).parent.absolute()
schema_def = load_schema_from_path(str(this_dir))
schema = make_executable_schema(schema_def, *queries)
