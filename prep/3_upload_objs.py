"""
Comparing file sizes:
- all coords pkl: 19M
- all coords json: 89M
- single coord pkl: 350
- single coord json: 1.6k
"""
import pickle

# TODO

with open("data/monthly_counts_2020.pkl", "rb") as fh:
    data = pickle.load(fh)

single_file = data[2020][1]


with open("data/2020/1/avgwinds_40;20.pkl", "wb") as fh:
    pickle.dump(single_file[(40, 20)], fh)

