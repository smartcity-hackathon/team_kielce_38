const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const mysql = require('mysql');
const forceSsl = require('express-force-ssl');
const distance = require('./modules/geolocation.js');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/smartkielce.tk/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/smartkielce.tk/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/smartkielce.tk/chain.pem', 'utf8');
var template = ejs.compile(fs.readFileSync(__dirname + "/views/index.ejs", 'utf8'));

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
const https = require('https').createServer(credentials, app);
const io = require('socket.io').listen(https);
app.use(forceSsl);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(__dirname+'/static'));
app.use(express.static(__dirname+'/vendor'));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended   :  false}));
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(session({
  secret:'aosiufjsaidufhasidfasdfas',
  resave:false,
  saveUninitialized:false,
  //cookie:{secure:true}
}));
app.use(cookieParser());

//Database setup
require('dotenv').config();
const options  = {
  host      :   process.env.DB_HOST,
  user      :   process.env.DB_USER,
  password  :   process.env.DB_PASS,
	database 	:		process.env.DB_NAME
};
const database = mysql.createConnection(options);
database.connect((err)=>{
  if(err) throw err;
  console.log('MySQL-server has been connected.');
});
var resultdatabase = [];
let sql = ' SELECT * FROM `ankieta_pyt`';
database.query(sql,(err,result)=>{
	if(err)throw err;
	resultdatabase = result;
	console.log(resultdatabase);
});

function predicate() {
	 var fields = [],
		 n_fields = arguments.length,
		 field, name, reverse, cmp;

	 var default_cmp = function (a, b) {
			 if (a === b) return 0;
			 return a < b ? -1 : 1;
		 },
		 getCmpFunc = function (primer, reverse) {
			 var dfc = default_cmp,
				 // closer in scope
				 cmp = default_cmp;
			 if (primer) {
				 cmp = function (a, b) {
					 return dfc(primer(a), primer(b));
				 };
			 }
			 if (reverse) {
				 return function (a, b) {
					 return -1 * cmp(a, b);
				 };
			 }
			 return cmp;
		 };

	 // preprocess sorting options
	 for (var i = 0; i < n_fields; i++) {
		 field = arguments[i];
		 if (typeof field === 'string') {
			 name = field;
			 cmp = default_cmp;
		 } else {
			 name = field.name;
			 cmp = getCmpFunc(field.primer, field.reverse);
		 }
		 fields.push({
			 name: name,
			 cmp: cmp
		 });
	 }

	 // final comparison function
	 return function (A, B) {
		 var a, b, name, result;
		 for (var i = 0; i < n_fields; i++) {
			 result = 0;
			 field = fields[i];
			 name = field.name;

			 result = field.cmp(A[name], B[name]);
			 if (result !== 0) break;
		 }
		 return result;
	 };
 }

app.get('/', (req, res) => {
		var dbcopy = resultdatabase;

		dbcopy.sort(predicate({
    name: 'popularity',
    reverse: true
  }, 'distance'));
		console.log(dbcopy)
		resultdatabase.sort(function (a, b) {
		  return a.distance - b.distance;
		});

		res.send(template({results1: resultdatabase[0], results2: resultdatabase[1], results3: resultdatabase[2]}));
		//res.render('index', {results1: resultdatabase[0], results2: resultdatabase[1], results3: resultdatabase[2]});

});

app.get('/getjson', (req, res) => {
	res.send(JSON.stringify(resultdatabase));
});

app.get('/form', (req, res) => {
	res.render('form');
});

app.get('/plot', (req, res) => {
	res.render('plot');
});

app.get('/createDatabase',(req,res)=>{
  let sql = 'CREATE DATABASE IF NOT EXISTS smart_db';
  database.query(sql,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.send('Database has been created');
  });
});
app.get('/createUserTable',(req,res)=>{
  let sql = 'CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, name VARCHAR(255),surname VARCHAR(255), password VARCHAR(255), type VARCHAR(255), email VARCHAR(255),  token VARCHAR(255), PRIMARY KEY(id))';
  database.query(sql,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.send('Table users created');
  });
});
app.get('/createBinarySurveysTable',(req,res)=>{
  let sql = 'CREATE TABLE IF NOT EXISTS binary_surveys(id int AUTO_INCREMENT, question VARCHAR(255), type VARCHAR(255), yes_vote INT, no_vote INT, PRIMARY KEY(id))';
  database.query(sql,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.send('Table binary_surveys created')
  });
});
app.get('/createStarSurveysTable',(req,res)=>{
  let sql = 'CREATE TABLE IF NOT EXISTS star_surveys(id int AUTO_INCREMENT, question VARCHAR(512), type VARCHAR(255), star_number INT, PRIMARY KEY(id))';
  database.query(sql,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.send('Table star_surveys created');
  });
});
app.get('/createMultipleChoiceSurveysTable',(req,res)=>{
  let sql = 'CREATE TABLE IF NOT EXISTS multiple_choice_surveys(id int AUTO_INCREMENT, question VARCHAR(512), type VARCHAR(255), yes_vote INT, no_vote INT, PRIMARY KEY(id))';
  database.query(sql,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.send('Table multiple_choice_surveys created');
  });
});

http.listen(3000, () => {
	console.log('HTTP Server running on port 3000');
});

https.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

io.sockets.on('connection', (socket) => {
	socket.on('lolzdycham', (req, res) => {
		res.send(template({results1: resultdatabase[4], results2: resultdatabase[1], results3: resultdatabase[2]}));
	})

});
