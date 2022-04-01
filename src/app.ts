import express, { Request, Response } from 'express';
import mysql from 'mysql';
const appRoot = require('app-root-path');
require('dotenv').config();

const app = express();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: 'y978vzoi3rp1',
  password: 'pscale_pw_Kz3w6XVpjmwKdwJ6bh9ukyutk0MlrrfjVEQgxvxmzkI',
  database: process.env.db,
  ssl: {},
});
connection.connect();

app.get('/api/characters/:id', (req: Request, res: Response) => {
  const retVal = {
    message: 'Go to /api/characters',
  };
});

app.get('/api/characters', (req: Request, res: Response) => {
  const query = 'SELECT * FROM Characters';
  connection.query(query, (err, data) => {
    if (err) throw err;

    const retVal = {
      data: data,
      message: data.length === 0 ? 'No records found' : null,
    };

    return res.send(retVal);
  });
});

app.get('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const query = `SELECT * FROM Characters WHERE ID =  "${id}" LIMIT 1`;
  connection.query(query, (err, data) => {
    if (err) throw err;

    const retVal = {
      data: data.length > 0 ? data[0] : null,
      message: data.length === 0 ? 'No Data Found' : null,
    };

    return res.send(retVal);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
