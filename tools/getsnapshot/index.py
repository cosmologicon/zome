# Retrieve the specified playback id.

import os, sqlite3, sys, cgi, json

dbfilename = "/var/data/dump.db"

# Object to access the database with
class DB(object):
	def __enter__(self):
		self.db = sqlite3.connect(dbfilename)
		self.c = self.db.cursor()
		return self
	def query(self, qstring, params = ()):
		return self.c.execute(qstring, params).fetchall()
	def queryone(self, qstring, params = ()):
		return self.c.execute(qstring, params).fetchone()
	def querysingle(self, qstring, params = ()):
		ans = self.queryone(qstring, params)
		return ans and ans[0]
	def __exit__(self, typ, val, tb):
		if not tb:
			self.db.commit()
		self.db.close()

sys.stderr = sys.stdout
print("Content-type: application/json\n\n")
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
playbackid = form.get("id", "")

if not playbackid or not playbackid.isalnum() or len(playbackid) > 100:
	print("Invalid playback id: {}".format(playbackid))
	exit()

ret = { "snapshots": [] }
with DB() as db:
	for (value,) in db.query("SELECT data FROM dump WHERE project = 'zomesetup';"):
		setup = json.loads(value)
		if setup["id"] == playbackid:
			ret["setup"] = setup
			break
	if "setup" in ret:
		query = "SELECT data FROM dump WHERE project = ?;"
		params = ("zomesnap-" + playbackid,)
		for (value,) in db.query(query, params):
			snapshot = json.loads(value)
			ret["snapshots"].append(snapshot)
print(json.dumps(ret))

