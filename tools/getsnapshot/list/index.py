import os, sqlite3, sys, cgi, json

dbfilename = "/var/data/dump.db"

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


ret = []
with DB() as db:
	for (value,) in db.query("SELECT data FROM dump WHERE project = 'zomesetup';"):
		setup = json.loads(value)
		if setup["version"] < 3:
			continue
		playbackid = setup["id"]
		query = "SELECT timestamp, data FROM dump WHERE project = ? ORDER BY timestamp DESC LIMIT 1;"
		params = ("zomesnap-" + playbackid,)
		result = db.queryone(query, params)
		if not result:
			continue
		timestamp, data = result
		data = json.loads(data)
		ret.append({
			"id": playbackid,
			"url": setup["url"],
			"useragent": setup["support"]["useragent"],
			"timestamp": setup["timestamp"],
			"duration": data["t"],
		})
print("Content-type: application/json\n\n")
print(json.dumps(ret))

