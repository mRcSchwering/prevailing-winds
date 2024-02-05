import pandas as pd
from src import oras5


def test_digitize():
    df = pd.DataFrame({"a": [-180, -178, -176, -174, -172, -170]})
    oras5._digitize(df=df, var="a", interval=(-180, -170), res=5)
    assert df.loc[0, "a"] == -180
    assert df.loc[1, "a"] == -180
    assert df.loc[2, "a"] == -175
    assert df.loc[3, "a"] == -175
    assert df.loc[4, "a"] == -170
    assert df.loc[5, "a"] == -170
