import rethinkdb as r

hostname = 'localhost'
port = '28015'
db = 'inventory'

r.connect(hostname,port).repl()

def getUPC():
    scan = input('Please Enter UPC: ')
    cursor = r.db(db).table("upcs").filter(r.row["AcceptedUPC"] == scan).run()
    cursor = list(cursor)
    if cursor != []:
        print('UPC Scanned')
    else:
        print(scan + ' not found, please set via the Manager website')

while True:
    getUPC()