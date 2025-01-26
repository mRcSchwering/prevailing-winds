"""
CLI entrypoint.

    python -m main --help

"""

import datetime as dt
from argparse import ArgumentParser
from src import oras5
from src import era5
from src import aggregate
from src import upload
from src.config import Config, VARMAP


def _download_cmd(cnfg: Config, _: dict):
    oras5.download(cnfg=cnfg)
    era5.download(cnfg=cnfg)


def _extract_cmd(cnfg: Config, _: dict):
    oras5.extract(cnfg=cnfg)
    era5.extract(cnfg=cnfg)


def _aggregate_cmd(cnfg: Config, _: dict):
    funmap = {
        "wind": aggregate.winds,
        "temp": aggregate.temps,
        "seatemp": aggregate.seatemps,
        "wave": aggregate.waves,
        "rain": aggregate.rains,
        "current": aggregate.currents,
    }
    for label, years in cnfg.time_ranges.items():
        print(f"Aggregating {label}...")
        for variable in cnfg.variables:
            for month in cnfg.months:
                funmap[variable](
                    month=month, years=years, label=label, datadir=cnfg.datadir
                )


def _upload_cmd(cnfg: Config, kwargs: dict):
    for timerange in cnfg.time_ranges:
        for month in cnfg.months:
            upload.all_data(
                nthreads=cnfg.nproc * 5,
                month=month,
                version=kwargs["version"],
                label=timerange,
                datadir=cnfg.datadir,
                lat_range=cnfg.lat_range,
                lon_range=cnfg.lon_range,
                only_keys=kwargs["keys"],
            )


def _check_cmd(cnfg: Config, kwargs: dict):
    upload.check(
        version=kwargs["version"],
        labels=list(cnfg.time_ranges),
        months=cnfg.months,
        lon_range=cnfg.lon_range,
        lat_range=cnfg.lat_range,
    )


def main(kwargs: dict):
    cmd = kwargs.pop("cmd")
    cnfg = Config.pop_from_kwargs(kwargs)
    if kwargs["timerange"] is not None:
        cnfg.time_ranges = {
            k: d for k, d in cnfg.time_ranges.items() if k == kwargs["timerange"]
        }

    cmdmap = {
        "download": _download_cmd,
        "extract": _extract_cmd,
        "aggregate": _aggregate_cmd,
        "upload": _upload_cmd,
        "check": _check_cmd,
    }
    cmdmap[cmd](cnfg, kwargs)
    print("done")


if __name__ == "__main__":
    this_year = dt.date.today().year
    parser = ArgumentParser()
    parser.add_argument(
        "--inputdir",
        default="data/tmp",
        type=str,
        help="Path to directory with input data (default %(default)s)",
    )
    parser.add_argument(
        "--outputdir",
        default="data/tmp",
        type=str,
        help="Path to directory for output data (default %(default)s)",
    )
    parser.add_argument(
        "--variables",
        type=str,
        nargs="+",
        default=list(VARMAP),
        help="Download or process these variables (default %(default)s",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=list(range(this_year - 5, this_year)),
        nargs="+",
        help="Download or process these years (default %(default)s)."
        " Timeranges are constructed for all years and the youngest year.",
    )
    parser.add_argument(
        "--months",
        type=int,
        default=list(range(1, 13)),
        nargs="+",
        help="Download or process these months (default %(default)s)",
    )
    parser.add_argument(
        "--timerange",
        type=str,
        help="Subset years to a specific timerange",
    )
    parser.add_argument(
        "--nproc",
        default=4,
        type=int,
        help="Workers during multiprocessing (default %(default)s)",
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Reduces some variables to a minimum for testing (default %(default)s)",
    )
    subparsers = parser.add_subparsers(dest="cmd")
    subparsers.add_parser("download", help="Download raw data.")
    subparsers.add_parser("extract", help="Extract values from raw data.")
    subparsers.add_parser("aggregate", help="Aggregate values and calculate metrics.")
    upload_parser = subparsers.add_parser("upload", help="Upload to S3")
    upload_parser.add_argument("version", type=str, help="API version prefix")
    upload_parser.add_argument(
        "--keys",
        type=str,
        nargs="+",
        help="Optionally only upload data for these S3 specific keys.",
    )
    check_parser = subparsers.add_parser("check", help="Check uploaded files")
    check_parser.add_argument("version", type=str, help="API version prefix")
    args = parser.parse_args()
    main(vars(args))
