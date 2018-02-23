//Express web server requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

//MongoDB requirements
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'inventory';
MongoClient.connect(url, (err,client)=>{
    if (err) throw err;
    console.log('Connected to Inventory db!');
    const db = client.db(dbName);
    client.close();
});

//App specific variables
const empSubString = 'EMP';


//Web server uses
app.use(urlencodedParser);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/public')));

//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/Manager', (req,res) => {
    res.sendFile(path.join(__dirname + '/ManagerAccess.html'));
});
//get logged in employees
app.get('/employees', (req,res) => {
    MongoClient.connect(url, (err,client) => {
        if (err) throw err;
        const db = client.db(dbName);
        db.collection('employees').find({}).toArray((err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                console.log('No one is signed in...')
            } else {
                //console.log(results);
                res.send(results);
            }
            client.close;
        });
    });
});
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
app.post('/signin', (req,res) => {
    console.log(req.body);
    var employeeID = req.body.employee;
    if (employeeID == '') {
        console.log("its empty");
        res.send('Empty');
        res.end();
    } else if (employeeID.includes(empSubString)) {
        //Try/Insert into Mongo
        MongoClient.connect(url, (err,client)=>{
            if (err) throw err;
            const db = client.db(dbName);
            var employeeObj = {employee : employeeID};
            //Try to find it
            db.collection('employees').findOne(employeeObj, (err, resu) => {
                if (err) throw err;
                if (resu != null) {
                    db.collection('employees').deleteOne(employeeObj, (err, resu) => {
                        //Delete (log out)
                        if (err) throw err;
                        res.send('Delete');
                        res.end();
                        console.log(employeeID +' logged out');
                        client.close();
                      });
                } else {
                        //insert
                        db.collection('employees').insertOne(employeeObj, (err, resu) => {
                            if (err) throw err;
                            console.log(employeeID + ' inserted');
                            client.close();
                            res.status(200);
                            res.send(employeeID);
                            res.end();
                        });
                }
            }); 
        });
    } else {
        res.send("Invalid");
        console.log('You have entered an invalid Employee ID');
        res.end();
    }
    //res.sendFile(path.join(__dirname + '/index.html'));
});

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
    //res.sendFile(path.join(__dirname + '/ManagerAccess.html'));
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

//Finally, start the server
app.listen(8080, () => console.log('Listening on port 8080!'))