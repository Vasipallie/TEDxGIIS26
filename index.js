import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
const canonicalHost = 'tedxgiis.app';
const canonicalOrigin = `https://${canonicalHost}`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    const forwardedHost = req.headers['x-forwarded-host'];
    const forwardedProto = req.headers['x-forwarded-proto'];
    const hostHeader = (forwardedHost || req.headers.host || '').split(',')[0].trim().toLowerCase();
    const protocol = (forwardedProto || req.protocol || 'http').split(',')[0].trim().toLowerCase();
    const isLocalHost = hostHeader.startsWith('localhost') || hostHeader.startsWith('127.0.0.1');
    const hasFileExtension = path.extname(req.path) !== '';
    const normalizedPath = !hasFileExtension && req.path !== '/' ? req.path.replace(/\/+$/, '') || '/' : req.path;
    const shouldRedirectHost = hostHeader && !isLocalHost && hostHeader !== canonicalHost;
    const shouldRedirectProtocol = hostHeader && !isLocalHost && protocol !== 'https';
    const shouldRedirectPath = normalizedPath !== req.path;

    if (!shouldRedirectHost && !shouldRedirectProtocol && !shouldRedirectPath) {
        return next();
    }

    const queryPart = req.url.slice(req.path.length);
    return res.redirect(301, `${canonicalOrigin}${normalizedPath}${queryPart}`);
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sitemap.xml'));
});

const pages = [
    {
        route: '/',
        view: 'index',
        activePage: 'home',
        title: 'TEDxGIIS Youth | Ikigai',
        description: 'Official TEDxGIIS Youth event website featuring Ikigai-themed talks, event details, registration, and updates.',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: 'TEDxGIIS Youth',
            url: canonicalOrigin,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            startDate: '2026-10-05T09:00:00+08:00',
            location: {
                '@type': 'Place',
                name: 'GIIS Smart Campus',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '27 Punggol Field Walk',
                    addressLocality: 'Singapore',
                    postalCode: '828649',
                    addressCountry: 'SG'
                }
            },
            organizer: {
                '@type': 'Organization',
                name: 'TEDxGIIS Youth'
            }
        }
    },
    {
        route: '/speakers',
        view: 'speakers',
        activePage: 'speakers',
        title: 'Speakers | TEDxGIIS Youth',
        description: 'Explore the TEDxGIIS Youth speaker lineup and discover voices sharing ideas inspired by Ikigai.'
    },
    {
        route: '/team',
        view: 'team',
        activePage: 'team',
        title: 'Team | TEDxGIIS Youth',
        description: 'Meet the student-led TEDxGIIS Youth organizing team behind the event.'
    },
    {
        route: '/registration',
        view: 'registration',
        activePage: 'registration',
        title: 'Registration | TEDxGIIS Youth',
        description: 'Register for TEDxGIIS Youth to receive event updates, timing information, and participation details.'
    }
];

pages.forEach((page) => {
    app.get(page.route, (req, res) => {
        res.render(page.view, {
            activePage: page.activePage,
            pageTitle: page.title,
            pageDescription: page.description,
            canonicalUrl: `${canonicalOrigin}${page.route}`,
            ogImageUrl: `${canonicalOrigin}/resources/ikigai.jpg`,
            structuredDataJson: page.structuredData ? JSON.stringify(page.structuredData) : null
        });
    });
});

app.listen(port, () => {
    console.log('server is running on port ' + port);
    console.log('http://localhost:' + port);
});
