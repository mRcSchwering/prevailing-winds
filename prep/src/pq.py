from pathlib import Path
import pandas as pd
import pyarrow as pa
from pyarrow import parquet


def write_table(df: pd.DataFrame, file: str | Path):
    """Write DataFrame to parquet file"""
    parquet.write_table(pa.Table.from_pandas(df), file)


def read_table(file: str | Path) -> pd.DataFrame:
    """Read DataFrame from parquet file"""
    df = parquet.read_table(file).to_pandas()
    df.columns = [str(d) for d in df.columns]  # forgot why I need this
    return df
