var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trouvetonasso'
});


connection.connect(function(error){
  if (!!error){
    console.log('Error');
  }else {
    console.log('Connected');
  }
});

app.get('/', function(req, resp){
  //about mysql
  connection.query("SELECT * FROM association", function(error, rows, fields){
    //callback
    if(!!error){
      console.log('Error in the query');
    }else{
      console.log('Success\n');
      resp.send("Hello "+ rows[0].nom_asso)
    }
  });
})

app.listen(1337);
