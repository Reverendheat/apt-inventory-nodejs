import socket
import sys
import rethinkdb as r
import datetime
import re

#Rethink connections
hostname = 'localhost'
port = '28015'
db = 'inventory'
r.connect(hostname,port).repl()

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the address given on the command line
server_address = ('', 10000)
sock.bind(server_address)
print('starting up on {} port {}'.format(*sock.getsockname()))
sock.listen(1)

while True:
    print('waiting for a connection')
    connection, client_address = sock.accept()
    try:
        print('client connected:', client_address)
        while True:
            data = connection.recv(2048)
            print('received {!r}'.format(data))
            if data:
                try:
                    if data.decode() == "\r\n":
                        raise Exception
                    data = (data.decode('utf-8'))
                    print(data)
                    cursor = r.db(db).table("upcs").filter(r.row["AcceptedUPC"] == data).run()
                    print(cursor)
                    cursor = list(cursor)
                    print(cursor)
                    if cursor != []:
                        sqlTime = datetime.datetime.now()
                        fileNameFormatted = "{:%m-%d-%Y %I%M%S%p}".format(sqlTime)
                        sqlTimeFormatted = "{:%m-%d-%Y %I:%M:%S%p}".format(sqlTime)
                        filename = "Scans"  + fileNameFormatted + ".csv"
                        good_message = "Scanned at {:%m-%d-%Y %I:%M:%S%p}".format(sqlTime) + '\n'
                        print (good_message)
                        connection.sendall(good_message.encode())
                        f = open(filename, 'w')
                        for item in cursor:
                            f.write("UPC Scanned" + ',' + "Date Entered" + '\n')
                            f.write(item['AcceptedUPC'] + ',' + sqlTimeFormatted + '\n')
                            f.close()
                    else:
                        bad_message = 'UPC not found..' + '\n'
                        print(data.decode('utf-8') + fileNameFormatted)
                        print(bad_message)
                        connection.sendall(bad_message.encode())
                except:
                    pass
                    print("Exception was raised...")
            else:
                break
    finally:
        connection.close()