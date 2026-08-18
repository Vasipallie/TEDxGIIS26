import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

//Middleware`
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/speakers', (req, res) => {
    res.render('speakers');
});

app.get('/team', (req, res) => {
    res.render('team');
});

app.get('/registration', (req, res) => {
    res.render('registration');
});
/* 

app.get('/login', (req, res) => {
    res.render('gam');
});

app.get('/account', (req, res) => {
    res.render('gam');
}); */
//Start Service
app.listen(3000, () => {
    console.log('server is running on port 3000');
    console.log("http://localhost:3000");
});
