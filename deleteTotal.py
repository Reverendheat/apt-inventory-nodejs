import csv
import sys
import rethinkdb as r

conn = r.connect(db='inventory')
r.table('totalCounts').delete().run(conn)
