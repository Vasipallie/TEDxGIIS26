import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pages = ['/', '/speakers', '/team', '/registration'];

pages.forEach((route) => {
    app.get(route, (req, res) => {
        const view = route === '/' ? 'index' : route.slice(1);
        res.render(view);
    });
});

app.listen(port, () => {
    console.log('server is running on port ' + port);
    console.log('http://localhost:' + port);
});
