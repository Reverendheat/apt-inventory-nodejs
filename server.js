//App specific variables
const empSubString = 'EMP';

//File System requirements
const fs = require('fs');
const csvFolder = 'csv/';
//Windows CSV folder
//const csvFolder = './csv';

//Fast-CSV requiremnts
const csv = require('fast-csv')

//UUID requirements
const uuidv4 = require('uuid/v4');

//Date time requirements
const moment = require('moment');

//Net Server for TCP Connections
const net = require('net');
const netserver = net.createServer();

//Express web server requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//RethinkDB Requirements
const r = require('rethinkdb');
const config = require('./config')
const databaseController = require('./controllers/databaseController');

//Create the CSV folder if it doesn't exist
if (!fs.existsSync(csvFolder)) {
    fs.mkdirSync(csvFolder);
    console.log('I made the csv folder for you');
}

//Start the server
const server = app.listen(config.express.port, () => console.log('Listening on port '+ config.express.port))

//Express Web uses
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/public')));

//Socket IO requirements
const socket = require('socket.io');
const io = socket(server);

//Socket IO Events
io.on('connection', (socket) => {
    console.log('A new friend has arrived from ' + socket.handshake.address);
    socket.on('disconnect', () => {
        console.log('Goodbye ' + socket.handshake.address + ' ):');
    });
});


//RethinkDB Connection/Creation of DB and Table Monitoring
r.connect(config.rethinkdb, function(err, conn) {
    if (err) {
        console.log('Could not open a connection to initialize the database: ' + err.message);
    }
    else {
        console.log('Connected.');
        app.set('rethinkdb.conn', conn);
        databaseController.createDatabase(conn, config.rethinkdb.db)
            .then(function() {
                return databaseController.createTable(conn, 'employees');
            }).then(function() {
                return databaseController.createTable(conn, 'upcs');
            }).then(function() {
                return databaseController.createTable(conn, 'totalCounts');
            }).then(()=>{
                r.table('upcs').changes().run(conn, (err,cursor) => {
                    cursor.each((err,item)=>{
                        io.emit('upc_updated', item);
                    })
                });
            }).then(()=> {
                    r.table('employees').changes().run(conn, (err,cursor) => {
                    cursor.each((err,item)=>{
                    io.emit('emp_updated', item);
                    })
                });
            })
            .catch(function(err) {
                console.log('Error connecting to RethinkDB: ' + err);
            });
    }
    app.get('/employees', (req,res) => {
        r.table('employees').orderBy('date').run(conn, (err, cursor)=>{
            if (err) throw err;
            cursor.toArray((err,result)=>{
                if (err) throw err;
                res.send(result);
            })
        })
    });
    app.get('/upcs', (req,res) => {
        r.table('upcs').orderBy('date').run(conn, (err, cursor)=>{
            if (err) throw err;
            cursor.toArray((err,result)=>{
                if (err) throw err;
                res.send(result);
            })
        })
    });
    app.get('/upccounts', (req,res) => {
        r.table('upcs').filter(r.row.hasFields('UPCCount')).orderBy('UPCCount').run(conn, (err, cursor)=>{
            if (err) throw err;
            cursor.toArray((err,result)=>{
                if (err) throw err;
                res.send(result);
            })
        })
    });
    app.get('/totalcounts', (req,res) => {
        r.table('totalCounts').run(conn, (err, cursor)=>{
            if (err) throw err;
            cursor.toArray((err,result)=>{
                if (err) throw err;
                res.send(result);
            })
        })
    });
    app.post('/signin', (req,res) => {
        var employeeID = req.body.employee;
        console.log(employeeID);
        if (employeeID == '') {
            console.log("EMP sign-in is empty");
            res.send('Empty');
            res.end();
        } else if (employeeID.includes(empSubString)) {
            //Try/Insert into ReThinkDB
            var employeeObj = {employee : employeeID};
            //Try to find it
            r.table('employees').filter({employee:employeeID}).run(conn, (err, cursor) => {
                if (err) throw err;
                cursor.toArray((err,resu) => {
                    if (err) throw err;
                    if (resu.length != 0) {
                    r.table('employees').filter({employee:employeeID}).delete().run(conn, (err, resu) => {
                        //Delete (log out)
                        if (err) throw err;
                        res.end();
                        console.log(employeeID +' logged out');
                        });
                    } else {
                        //insert
                        r.table('employees').insert({employee:employeeID,date: new Date()}).run(conn, (err, resu) => {
                            if (err) throw err
                            //fs.appendFile();
                            console.log(employeeID + ' inserted');
                            res.status(200);
                            res.end();
                        });
                    } 
                });
            }); 
        } else {
            res.send("Invalid");
            console.log('They entered have entered an invalid Employee ID');
            res.end();
        }
    });
    app.post('/upcchange', (req,res) => {
        var acceptedupc = req.body.AcceptedUPC;
        var upcCount = req.body.UPCCount;
        r.table('upcs').filter({AcceptedUPC:acceptedupc}).filter(r.row.hasFields("UPCCount")).orderBy('UPCCount').run(conn, (err,cursor) => {
            if (err) throw err;
            cursor.toArray((err,resu) => {
                if (err) throw err;
                if (upcCount == 0) {
                    r.table('upcs').filter({AcceptedUPC:acceptedupc}).replace(r.row.without('UPCCount')).run(conn, (err, resu) => {
                        if (err) throw err;
                        console.log(acceptedupc + ' count has been removed because it was set to 0 on the manager screen');
                        res.send(upcCount.toString());
                        res.end();
                    });
                } else {
                    r.table('upcs').filter({AcceptedUPC:acceptedupc}).update({UPCCount: upcCount}).run(conn, (err, resu) => {
                        if (err) throw err;
                        console.log(acceptedupc + ' count has been updated to ' + upcCount);
                        res.send(upcCount.toString());
                        res.end();
                    });
                }
            });
        });
    });
    app.post('/upcset', (req,res) => {
        var acceptedupc = req.body.AcceptedUPC;
        var upcCount = req.body.UPCCount;
        if (acceptedupc == '') {
            console.log("You have not entered any UPC");
            res.send('Empty');
            res.end();
        } else if (acceptedupc.includes(empSubString)) {
            console.log('You are trying to enter an employee ID on the management screen, go back to the Employee Sign-in page');
            res.send('EMP');
            res.end();
        } else {
            //Try to find it
            r.table('upcs').filter({AcceptedUPC:acceptedupc}).run(conn, (err, cursor) => {
                if (err) throw err;
                cursor.toArray((err,resu) => {
                    if (err) throw err;
                    if (resu.length != 0) {
                        r.table('upcs').filter({AcceptedUPC:acceptedupc}).delete().run(conn, (err, resu) => {
                        //Delete (log out)
                        if (err) throw err;
                        res.end();
                        console.log(acceptedupc +' removed');
                        });
                    } else {
                        //insert
                        if (upcCount == 0) {
                            r.table('upcs').insert({AcceptedUPC:acceptedupc,date: new Date()}).run(conn, (err, resu) => {
                                if (err) throw err;
                                console.log(acceptedupc + ' inserted');
                                res.status(200);
                                res.end();
                            });
                        } else {
                            r.table('upcs').insert({AcceptedUPC:acceptedupc,date: new Date(),UPCCount:upcCount}).run(conn, (err, resu) => {
                                if (err) throw err;
                                console.log(acceptedupc + ' inserted');
                                res.status(200);
                                res.end();
                            });
                        }
                    } 
                });
            }); 
        }
    });
    app.post('/clearallEMP', (req,res) => {
        r.table('employees').delete().run(conn,(err,resu) => {
            console.log("Employees all signed out");
        });
    });
    app.post('/clearallUPC', (req,res) => {
        r.table('upcs').delete().run(conn, (err, resu) => {
            console.log("Accepted UPCs have been cleared");
        });
    });
    //netserver.listen(netPORT, netHOST);
    netserver.on('connection', function(sock) {
        console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
        console.log('Server listening on ' + netserver.address().address +':' + netserver.address().port);
        sock.on('data', function(data){
            sock.write('You said ' + data);
            data = data.toString('utf-8');
            data = data.trim();
            r.table('upcs').filter({AcceptedUPC:data}).run(conn, (err, cursor) => {
                if (err) throw err;
                cursor.toArray((err,resu) => {
                    if (err) throw err;
                    if (resu.length != 0) {
                        if (resu[0].UPCCount != null) {
                            console.log('There is a count on this record, and the value is ' + resu[0].UPCCount );
                            if (resu[0].UPCCount == 1) {
                                r.table('upcs').filter({AcceptedUPC:data}).delete().run(conn, (err, resu) => {
                                    if (err) throw err;
                                    console.log('Entry removed because the countdown reached 0');
                                });
                            }
                        } 
                        var now = moment().format("MM/DD/YYYY hh:mm:ss A");
                        r.table('totalCounts').insert({
                            Type: "Success",
                            Date: now
                        }).run(conn, (err, resu) => {
                            if (err) throw err;
                        });
                        r.table('totalCounts').filter({Type:"Success"}).count().run(conn, (err, resu) => {
                            if (err) throw err;
                            console.log(resu);
                            io.emit("SuccessReading",resu);
                        });
                        io.emit("UPCScanned",data);
                        sock.write('I Found it!');
                        var now = moment().format("MM/DD/YYYY hh:mm:ss A")
                        var uid = uuidv4();
                        var ws = fs.createWriteStream("csv/Scans" + uid + ".csv");
                        csv
                            .write([
                                [data, now]
                            ], {headers: true})
                            .pipe(ws);
                    } else {
                        var now = moment().format("MM/DD/YYYY hh:mm:ss A");
                        r.table('totalCounts').insert({
                            Type: "Error",
                            Date: now
                        }).run(conn, (err, resu) => {
                            if (err) throw err;
                        });
                        r.table('totalCounts').filter({Type:"Error"}).count().run(conn, (err, resu) => {
                            if (err) throw err;
                            console.log(resu);
                            io.emit("ErrorReading",resu);
                        });
                        sock.write('Error reading.');
                    }
                })
            }).then(
             r.table('upcs').filter({AcceptedUPC:data}).filter(r.row.hasFields("UPCCount")).update({UPCCount: r.row("UPCCount").sub(1)}).run(conn, (err,cursor) => {
                if (err) throw err;
            }));
        })
        sock.on('close', function(data) {
            console.log("Goodbye, " + sock.remoteAddress +':'+ sock.remotePort)
        })
    }).listen(config.netserver.port, config.netserver.host);
});

//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/Manager', (req,res) => {
    res.sendFile(path.join(__dirname + '/ManagerAccess.html'));
});

//Get requests
app.get('/Status', (req,res) => {
    res.sendFile(path.join(__dirname + '/Status.html'));
});


