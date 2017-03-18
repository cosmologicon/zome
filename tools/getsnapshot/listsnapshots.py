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

with DB() as db:
	for (value,) in db.query("SELECT data FROM dump WHERE project = 'zomesetup';"):
		setup = json.loads(value)
		if setup["version"] == 0:
			continue
		playbackid = setup["id"]
		query = "SELECT data FROM dump WHERE project = 'zomesnap' AND data LIKE ?;"
		params = ("%" + playbackid + "%",)
		nframe = len(db.query(query, params))
		print(playbackid, nframe)



