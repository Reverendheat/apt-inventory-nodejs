//App specific variables
const empSubString = 'EMP';

//Express web server requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
//Start the server
const server = app.listen(80, () => console.log('Listening on port 80!'))

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


//RethinkDB Requirements
const r = require('rethinkdb');
const config = require('./config')
const databaseController = require('./controllers/databaseController');

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
                    console.log(resu);
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
    r.table('upcs').changes().run(conn, (err,cursor) => {
        cursor.each((err,item)=>{
            io.emit('upc_updated', item);
        })
    });
    r.table('employees').changes().run(conn, (err,cursor) => {
        cursor.each((err,item)=>{
            io.emit('emp_updated', item);
        })
    });
});


//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/Manager', (req,res) => {
    res.sendFile(path.join(__dirname + '/ManagerAccess.html'));
});
//get logged in employees


//Get UPCs list
app.get('/upcs', (req,res) => {
    MongoClient.connect(url, (err,client) => {
        if (err) throw err;
        const db = client.db(dbName);
        db.collection('upc').find({}).toArray((err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                console.log('No upcs have been set...')
            } else {
                //console.log(results);
                res.send(results);
            }
            client.close;
        });
    });
});

//Post requests (forms)

app.post('/upcset', (req,res) => {
    console.log(req.body);
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
        //Try/Insert into Mongo
        MongoClient.connect(url, (err,client)=>{
            console.log('tried to connect');
            if (err) throw err;
            const db = client.db(dbName);
            var upcObj = {AcceptedUPC : acceptedupc};
            //Try to find it
            db.collection('upc').findOne(upcObj, (err, resu) => {
                //console.log(res);
                if (err) throw err;
                if (resu != null) {
                    db.collection('upc').deleteOne(upcObj, (err, resu) => {
                        //Delete
                        if (err) throw err;
                        console.log(acceptedupc + ' has been removed');
                        client.close();
                        res.send('Delete');
                        res.end();
                      });
                } else {
                        //insert
                        db.collection('upc').insertOne(upcObj, (err, resu) => {
                            if (err) throw err;
                            console.log(acceptedupc + ' has been added to the list of accepted UPCs');
                            client.close();
                            res.status(200);
                            res.send(acceptedupc);
                            res.end();
                        });
                }
            }); 
        });
    }
});

app.post('/clearallEMP', (req,res) => {
    MongoClient.connect(url, (err,client)=>{
            if (err) throw err;
            const db = client.db(dbName);
            db.collection('employees').remove({}, (err, numberRemoved) => {
                console.log("Employees all signed out");
            });
            client.close();
    });
});

app.post('/clearallUPC', (req,res) => {
    MongoClient.connect(url, (err,client)=>{
            if (err) throw err;
            const db = client.db(dbName);
            db.collection('upc').remove({}, (err, numberRemoved) => {
                console.log("Accepted UPCs have been cleared");
            });
            client.close();
    });
});
