
import socket
import sys
import rethinkdb as r
import datetime

#Rethink connection
hostname = 'localhost'
port = '28015'
db = 'inventory'

# Connect to RethinkDB
r.connect(hostname,port).repl()

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the port
server_address = ('', 10000)
print('starting up on {} port {}'.format(*server_address))
sock.bind(server_address)

# Listen for incoming connections
sock.listen(1)

while True:
    # Wait for a connection
    print('waiting for a connection')
    connection, client_address = sock.accept()
    try:
        print('connection from', client_address)

        # Receive the data in small chunks and retransmit it
        while True:
            data = connection.recv(16)
            print('received {!r}'.format(data))
            cursor = r.db(db).table("upcs").filter(r.row["AcceptedUPC"] == data).run()
            cursor = list(cursor)
            if cursor != []:
                print('Scanned!')
                connection.sendall(data)
                test = "NICE YOU SCANNED IT\n"
                connection.sendall(test.encode())
            else:
                print('UPC not found....', client_address)

    finally:
        # Clean up the connection
        connection.close()