const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const con = require('./db');
// login routes
//===== hash password =====
    app.get('/password/:pass', (req, res) => {
    const password = req.params.pass;
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) {
            return res.status(500).send('Hashing error');
        }
        res.send(hash);
    });
});

// login
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], function(err, results) {
        if(err) {
            return res.status(500).send("Database server error");
        }
        if(results.length != 1) {
            return res.status(401).send("Wrong username or password");
        }
        // compare passwords
        bcrypt.compare(password, results[0].password, function(err, same) {
            if(err) {
                return res.status(500).send("Hashing error");
            }
            if(same) {
                return res.send("Login OK");
            }
            return res.status(401).send("Wrong username or password");
        });
    })
});

// expense routes
//======= Route fisrt =======

//======= Route second =======

//======= Route third ========

//======= Route fourth =======

//======= Route fifth =======


//================ Show PORT =========================

const PORT =  3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});
