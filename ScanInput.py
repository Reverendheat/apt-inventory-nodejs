import rethinkdb as r
import datetime

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
        sqlTime = datetime.datetime.now()
        fileNameFormatted = "{:%m-%d-%Y %I%M%S%p}".format(sqlTime)
        sqlTimeFormatted = "{:%m-%d-%Y %I:%M:%S%p}".format(sqlTime)
        filename = "Scans"  + fileNameFormatted + ".csv"
        print ("Scanned at {:%m-%d-%Y %I:%M:%S%p}".format(sqlTime))
        f = open(filename, 'w')
        for item in cursor:
            f.write("UPC Scanned" + ',' + "Date Entered" + '\n')
            f.write(item['AcceptedUPC'] + ',' + sqlTimeFormatted + '\n')
        f.close()
    else:
        print(scan + ' not found, please set via the Manager website')

while True:
    getUPC()