import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.get(['/speakers', '/speakers/'], (req, res) => {
    res.render('speakers');
});

app.get(['/team', '/team/'], (req, res) => {
    res.render('team');
});

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.listen(port, () => {
    console.log('server is running on port ' + port);
    console.log('http://localhost:' + port);
});
