//link to website: http://localhost:8080/


var http=require("http");
var fs=require("fs");
var qs=require("querystring");
var url=require("url");
var express=require("express");
var app=express();
app.use(express.json());

var events=require("events");
var eventEmitter=new events.EventEmitter();//Creating the event handler

//Initialising the database
var mysql=require("mysql");

var con=mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"Root",
    database:"Accounts"

});


//Initialising the variables
var Username;
var Password;

var Message="Void";
var TableData="Void";


function VerifyUserID(req) {

    SelectAll();

    Username=req.body.Username;
    Password=req.body.Password;

    con.query("SELECT * FROM accountid WHERE Username="+JSON.stringify(Username), function(err, result, fields) {

        if(err) throw err;

        if(result.length==0) {

            console.log("This username does not exist in the database");
            InsertInto();
            console.log("Username valid");
            Message="Username valid";
           // res.send("Username valid");

        }

        else if(result.length==1) {

            console.log("This username exists in the database");
            console.log("Username invalid");
            Message="Username invalid";
           // res.send("Username invalid");

        }
    })

}



function ChangePassword(req) {

    Username=req.body.Username;
    NewPassword=req.body.NewPassword;

    con.query("UPDATE accountid SET Password="+JSON.stringify(NewPassword)+" WHERE Username="+JSON.stringify(Username), function(err, result, fields) {

        if(err) throw err;

        console.log("The password of the username: "+Username+", was changed to: "+NewPassword);
        SelectAll();

    });

}


app.use(function(req,res) {

    if(req.method=="POST") {

        if(req.url=="/data") {
            
           VerifyUserID(req);
           console.log(Message);

           if(Message!="Void") {

                return res.send(Message);
           }
        }

        if(req.url=="/requestData") {

            SelectAll();
            
            if(TableData!="Void") {

                console.log("Table data sent");
                return res.send(TableData);
            }

            else {
                
                SelectAll();
                console.log("Table data sent data: "+TableData);
                return res.send(TableData);
            }
        }

        if(req.url="/ChangePassword") {

            console.log("New password: "+req.body.NewPassword);
            console.log("Username: "+req.body.Username);

            ChangePassword(req);

        }

    }

    var q=url.parse(req.url, true);
    var filename="."+q.pathname;

    fs.readFile(filename, function(err, data) {

        if(err) {
            
            res.writeHead(404, {"Content-type":"text/html"});
            return res.end("404 Not Found");

        }

        res.writeHead(200, {"Content-type":"text/html"});
        res.write(data);
        return res.end();

    });

});



/*
var SubmitData=function() {

    console.log("The event has been fired");
    SelectAll();
    VerifyUserID();

}
*/
//eventEmitter.on("Submit", SubmitData);//Assigning the event handler to the event



//Reading the files
//var Username;
//var Password;


app.get("/", function(req, res){

    res.sendFile(__dirname+"/index.html");

});


app.post("/data", VerifyUserID);

/*
app.post("/data", function(req, res){

    Username=req.body.Username;
    Password=req.body.Password;

    SubmitData();
    //eventEmitter.emit("Submit");

    console.log("The username is: "+req.body.Username);
    console.log("The password is: "+req.body.Password);
    
    res.send(Message);
    res.end();
    console.log(Message+" message");

});

*/

app.listen(8080, function(){

    console.log("The server is connected to port 8080");

});



//SQL commands
function InsertInto() {

    var sql="INSERT INTO accountid(Username, Password) VALUES?";
    var Values=[[Username, Password]]
    con.query(sql, [Values], function(err, result) {

        if(err) throw err;
        console.log(result.affectedRows+" records inserted!");

    });
}



function SelectAll() {

    con.query("SELECT * FROM accountid", function(err, result, fields) {

        if(err) throw err;
        console.log(result);
        TableData=result;

    });
}


function Delete() {

    var sql="DELETE FROM accountid WHERE Username!='Username1234'";

    con.query(sql, function(err, result) {

        if(err) throw err;
        console.log(result.affectedRows+" records deleted");
    });
}