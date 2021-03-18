"""
Comparing file sizes:
- pkl: 19M
- json: 89M
"""
import pickle
import json

with open("data/monthly_counts_2020.pkl", "rb") as fh:
    data = pickle.load(fh)

single_file = data[2020][1]

with open("data/2020/1/avgwinds.pkl", "wb") as fh:
    pickle.dump(single_file, fh)


json_save_single_file = {}
for pos, val in single_file.items():
    new_val = [
        {"dir_i": wind[0], "vel_i": wind[1], "count": count}
        for wind, count in val.items()
    ]
    json_save_single_file[f"{pos[0]:d};{pos[1]:d}"] = new_val


with open("data/2020/1/avgwinds.json", "w") as fh:
    json.dump(json_save_single_file, fh)

