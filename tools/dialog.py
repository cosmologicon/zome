# Format the dialog from the original game into JSON

import json

lines = {}
for line in open("/home/christopher/pyjam/zome/data/transcript.txt"):
	if not line:
		continue
	filename, who, line = line.split(" ", 2)
	convo = filename[:3]
	if convo not in lines:
		lines[convo] = []
	line = {
		"filename": filename,
		"who": { "Z": "zome", "S": "simon" }[who[0]],
		"text": line.strip(),
	}
	if "bounce" in who:
		line["bounce"] = float(who[7:])
	if "rock" in who:
		line["rock"] = float(who[5:])
	if "sink" in who:
		line["sink"] = True
	lines[convo].append(line)

json.dump(lines, open("/home/christopher/zome/level1/data/transcript.json", "w"))


