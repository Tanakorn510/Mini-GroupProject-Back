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
    const sql = "SELECT * FROM users WHERE username = ?";
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
                return res.json({ 
                    message: "Login OK", 
                    id: results[0].id,
                    username: results[0].username
                });
            }
            return res.status(401).send("Wrong username or password");
        });
    })
});


// expense routes
//======= Route fisrt =======
// show all expense by user id
app.get('/show_expense/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const sql = "SELECT* FROM expense WHERE user_id = ?";
    con.query(sql, [userId], function(err, results) {
        if(err) {
            return res.status(500).send("Database server error");
        }
        if(results.length === 0) {
            return res.status(404).send("no data found");
        }
        res.json(results);
    });
});



//======= Route third ========
// 3. Search expense
app.get('/expenses/search/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const item = req.body.item;
    const sql = "SELECT item, paid, date FROM expense WHERE user_id = ? AND item LIKE ?";
    con.query(sql, [user_id, `%${item}%`], function(err, results) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

//=================================================================================
//======= Route fourth =======
// 4. Add new expense
app.post('/add_expenses/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const {
        item,
        paid
    } = req.body;
    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], function(err, result) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        res.send("Add expense success");
    });
});
//======= Route fifth =======
// 5. Delete an expense
app.delete('/delete_expenses/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const id = req.body.id; 

    // ตรวจสอบว่า expense นี้เป็นของ user นี้หรือไม่
    const checkSql = "SELECT * FROM expense WHERE id = ? AND user_id = ?";
    con.query(checkSql, [id, user_id], function(err, results) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        if (results.length === 0) {
            return res.status(403).send("No permission to delete this expense");
        }
        // ถ้าใช่ ให้ลบ
        const deleteSql = "DELETE FROM expense WHERE id = ?";
        con.query(deleteSql, [id], function(err, result) {
            if (err) {
                return res.status(500).send("Database server error");
            }
            res.send("Delete expense success");
        });
    });
});


//================ Show PORT =========================

const PORT =  3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});
