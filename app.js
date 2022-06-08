const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const http = require('http');
const https = require('https');
const app = express();
const mysql = require('mysql');
const fs = require('fs');


//const date = require('date-and-time');
//const { Console } = require('console');
const cors = require('cors');

require('dotenv').config();

var options = {}

if (process.env.SSL_ENABLED == 1) {
    options = {
        key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERT, 'utf8'),
    }
}

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DBNAME,
    password: process.env.MYSQL_PASS,
    maxConnect: 10000,
    connectTimeout: 600000,
    connectLimit: 600000,
    multipleStatements: true,
    waitForConnections: true
})

global.misc = require('./services/Misc.js');

const port = 8911;
const sport = 8912;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);
app.use(cors());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        'error': {
            code: 404,
            message: 'page not found'
        }
    }));
    next();
});
router.route('/signin').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const login = req.body.username;
    const password = req.body.password;
    
    var sess = misc.hashPassword(`${login}${password}:mySalt${new Date()}`);
    var sql = `SELECT * FROM users WHERE name = '${login}'`;
    var result = await misc.query(connection, sql);

    if(!result.length) {
        res.send(JSON.stringify({
            'error': 'account not found'
        }));
        return;
    }

    if(result[0].password !== password) {
        res.send(JSON.stringify({
            'error': 'invalid password'
        }));
        return;
    }

    misc.query(connection, `UPDATE users SET session = '${sess}' WHERE id = ${result[0].id}`)
    res.send(JSON.stringify({
        'sessionCode': sess
    }));
});
router.route('/getUserBySession').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const session = req.body.session;
    var sql = `SELECT * FROM users WHERE session = '${session}'`;
    var result = await misc.query(connection, sql);

    if(!result.length) {
        res.send(JSON.stringify({
            'error': 'account not found'
        }));
        return;
    }
    res.send(JSON.stringify(result[0]));
});
router.route('/insertAuthor').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const name = req.body.name;
    const country = req.body.country;
    const result = await misc.query(connection, `INSERT INTO authors SET name = '${name}', country = '${country}'`);
    
    res.send(JSON.stringify(result));
});
router.route('/getAllAuthors').get(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const result = await misc.query(connection, 'SELECT `authors`.id, `authors`.`name`, `authors`.country, COUNT(`books`.id) AS books FROM `authors` LEFT JOIN books ON  `authors`.id = books.authorId GROUP BY `authors`.`name`');
    if(!result.length) {
        res.send(JSON.stringify(null));
        return;
    }
    res.send(JSON.stringify(result));
});
router.route('/updateAuthor').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = req.body.id;
    const name = req.body.name;
    const country = req.body.country;
    
    const result = await misc.query(connection, `UPDATE authors SET authors.name = '${name}', authors.country = '${country}' WHERE authors.id = ${id}`);
    
    res.send(JSON.stringify(result));
});
router.route('/deleteAuthor').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = req.body.id;
    
    const result = await misc.query(connection, `DELETE FROM  authors WHERE authors.id = ${id}`);
    await misc.query(connection, `DELETE FROM  books WHERE books.authorId = ${id}`);
    
    res.send(JSON.stringify(result));
});


router.route('/insertBook').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const name = req.body.name;
    const description = req.body.description;
    const id = req.body.author;
    const result = await misc.query(connection, `INSERT INTO books SET name = '${name}', description = '${description}', authorId = '${id}'`);
    
    res.send(JSON.stringify(result));
});
router.route('/getAllBooks').get(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const result = await misc.query(connection, 'SELECT books.`id`, books.`name`, books.description, `authors`.`name` as `author`, `authors`.`id` as `authorId` FROM	books	LEFT JOIN	`authors`	ON books.authorId = `authors`.id ORDER BY books.id DESC');
    if(!result.length) {
        res.send(JSON.stringify(null));
        return;
    }
    res.send(JSON.stringify(result));
});
router.route('/updateBook').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const authorId = req.body.author;
    
    const result = await misc.query(connection, `UPDATE books SET books.name = '${name}', books.description = '${description}', books.authorId = '${authorId}' WHERE books.id = ${id}`);
    
    res.send(JSON.stringify(result));
});
router.route('/deleteBook').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = req.body.id;
    
    const result = await misc.query(connection, `DELETE FROM  books WHERE books.id = ${id}`);
    
    res.send(JSON.stringify(result));
});

router.route('/api/v1/books/list').get(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    
    const result = {
        books: await misc.query(connection, 'SELECT books.`id`, books.`name`, books.description, `authors`.`name` as `author` FROM	books	LEFT JOIN	`authors`	ON books.authorId = `authors`.id ORDER BY books.id DESC')
    }
    
    res.send(JSON.stringify(result));
});

router.route('/api/v1/books/by-id/:id').get(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = parseInt(req.params.id);
    console.log(typeof id, id !== id);
    if(typeof id !== 'number' || id !== id){
        res.send(JSON.stringify({
            'error': {
                code: 404,
                message: 'page not found'
            }
        }));
        return;
    }
    const result = await misc.query(connection, 'SELECT * FROM books WHERE id = '+id);
    if(!result.length){
        res.send(JSON.stringify({
            'error': {
                code: 404,
                message: 'page not found'
            }
        }));
        return;
    }
    
    res.send(JSON.stringify(result[0]));
});



router.route('/api/v1/books/update/:id').post(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = parseInt(req.params.id);

    const name = req.body.name;
    const description = req.body.description;
    const authorId = req.body.author;
    
    
  

    console.log(typeof id, id !== id);
    if(typeof id !== 'number' || id !== id){
        res.send(JSON.stringify({
            'error': {
                code: 404,
                message: 'page not found'
            }
        }));
        return;
    }
    const result = await misc.query(connection, `UPDATE books SET books.name = '${name}', books.description = '${description}', books.authorId = '${authorId}' WHERE books.id = ${id}`);
    if(!result.length){
        res.send(JSON.stringify({
            'error': {
                code: 404,
                message: 'page not found'
            }
        }));
        return;
    }
    
    res.send(JSON.stringify(result[0]));
});

router.route('/api/v1/books/:id').delete(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    const id = parseInt(req.params.id);

    await misc.query(connection, `DELETE FROM  books WHERE books.id = ${id}`);

    res.send(JSON.stringify({
        response: {
            status: 200,
            message: `Book ${id} deleted successfully`
        }
    }));
});

http.createServer(app).listen(port, ()=>{
    console.log(`Unsecure server listening at http://localhost:${port}`);
});
if(process.env.SSL_ENABLED == 1){
    https.createServer(options, app).listen(sport, ()=>{
        console.log(`Secure server listening at https://localhost:${sport}`);
    });
}