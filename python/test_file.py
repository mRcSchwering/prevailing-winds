"""
Comparing file sizes:
- all coords pkl: 19M
- all coords json: 89M
- single coord pkl: 350
- single coord json: 1.6k
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


with open("data/2020/1/avgwinds_40;20.pkl", "wb") as fh:
    pickle.dump(single_file[(40, 20)], fh)


with open("data/2020/1/avgwinds_40;20.json", "w") as fh:
    json.dump(json_save_single_file["40;20"], fh)

