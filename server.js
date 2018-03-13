//App specific variables
const empSubString = 'EMP';

//File System requirements
const fs = require('fs');

//Date time requirements
const moment = require('moment');

//Express web server requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//RethinkDB Requirements
const r = require('rethinkdb');
const config = require('./config')
const databaseController = require('./controllers/databaseController');

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
    app.post('/signin', (req,res) => {
        var employeeID = req.body.employee;
        console.log(employeeID);
        if (employeeID == '') {
            console.log("its empty");
            res.send('Empty');
            res.end();
        } else if (employeeID.includes(empSubString)) {
            //Try/Insert into ReThinkDB
            var employeeObj = {employee : employeeID};
            console.log(employeeObj);
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
                            if (err) throw err;
                            
                            fs.appendFile();
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
    app.post('/upcset', (req,res) => {
        console.log(req.body.AcceptedUPC);
        var acceptedupc = req.body.AcceptedUPC;
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
                        r.table('upcs').insert({AcceptedUPC:acceptedupc,date: new Date()}).run(conn, (err, resu) => {
                            if (err) throw err;
                            console.log(acceptedupc + ' inserted');
                            res.status(200);
                            res.end();
                        });
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
});


//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/Manager', (req,res) => {
    res.sendFile(path.join(__dirname + '/ManagerAccess.html'));
});
