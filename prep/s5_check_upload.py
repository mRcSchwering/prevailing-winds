"""
Optionally check which objects were uploaded
In case some requests in s4 failed and you don't know which.

    python s5_check_upload.py

Can take around 5 minutes to query all objects.
"""
from itertools import product
from src.config import ALL_MONTHS, TIME_RANGES, VERSION_PREFIX
from src import s3


def main():
    lats = range(-70, 70)
    lngs = range(-180, 180)
    req_keys = set(
        f"{VERSION_PREFIX}/{y}/{m}/{lat}/{lng}/data.pkl"
        for y, m, lat, lng in product(TIME_RANGES, ALL_MONTHS, lats, lngs)
    )
    act_keys = set(s3.ls_obj_keys(prefix=VERSION_PREFIX))

    msg_keys = req_keys - act_keys
    msg_keys_str = " ".join([f"'{d}'" for d in msg_keys])
    print(f"\n{len(msg_keys):,} objects are missing.They are:\n\n{msg_keys_str}")
    wrng_keys = act_keys - req_keys
    wrng_keys_str = " ".join([f"'{d}'" for d in wrng_keys])
    print(f"\n{len(wrng_keys):,} objects are wrong. They are:\n\n{wrng_keys_str}")


if __name__ == "__main__":
    main()
