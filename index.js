import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createClient } from '@supabase/supabase-js';
import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
app.use(cookieParser());
const supalink = process.env.supalink;
const supakey = process.env.supakey;
const supabase = supalink && supakey ? createClient(supalink, supakey) : null;

const TOKEN = process.env.MAILTRAP;

const clientelle = new MailtrapClient({
  token: TOKEN,
});
/* 
const sender = {
  email: "TEDxGIIS@giisclubs.org",
    name: "TEDxGIIS Youth",
};
const recipients = [
  {
    email: "vasipallieshan@gmail.com",
  }
];

if (TOKEN) {
    clientelle
        .send({
            from: sender,
            to: recipients,
            subject: "Your TEDxGIIS Youth Express Pass",
            text: "We look forward to welcoming you to TEDxGIIS Youth, an event featuring inspiring talks from innovative thinkers and leaders.\n\nYour express pass is ready. Please present the QR code below at check-in on 5 October 2026 for express entry.\n\nWe look forward to seeing you there!",
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TEDxGIIS Youth Express Pass</title>
    <style>
        :root {
            --ted-red: #e62b1e;
            --ink: #111111;
            --muted: #b5b5b5;
            --paper: #ffffff;
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        body {
            font-family: "Host Grotesk", "Segoe UI", Arial, sans-serif;
            margin: 0;
            padding: 32px 16px 40px;
            background-color: #111111;
            line-height: 1.7;
        }

        .namebanner,
        .content,
        .contentq {
            width: 100%;
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
        }

        .namebanner {
            border-left: 3px solid #e62b1e;
            padding: 4px 0 4px 20px;
        }

        p {
            margin: 0 0 14px;
            font-size: 1.05rem;
            color: #ffffff;
        }

        .namebanner p:first-child {
            margin-bottom: 8px;
            color: #b5b5b5;
            font-size: 0.9rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .name {
            margin: 0;
            padding-bottom: 0;
            font-size: 42px;
            line-height: 1.05;
            letter-spacing: 0;
        }

        .content {
            padding: 32px 0 12px;
        }

        .content p:last-child {
            margin-bottom: 0;
            color: #b5b5b5;
            font-size: 0.98rem;
        }

        .contentq {
            margin-top: 24px;
            padding: 22px;
            background-color: #ffffff;
            color: #555b60;
            border-radius: 8px;
        }

        .qr {
            text-align: center;
            padding: 14px;
            border-radius: 8px;
        }

        .actualqr {
            width: 240px;
            max-width: 100%;
            margin: 0 auto;
        }

        .actualqr img {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 4px;
        }

        .contentq p {
            margin: 12px 0 0;
            color: #555b60;
            font-size: 1rem;
        }

        .contentq p + p {
            margin-top: 4px;
        }
    </style>
</head>
<body bgcolor="#111111" style="margin: 0; padding: 32px 16px 40px; background-color: #111111;">
    <div class="namebanner">
    <p>We look forward to welcoming you to TED<sup>x</sup>GIIS Youth</p>
    <p class="name" id="headname">Vasipalli Eshan Aditya</p>
    </div>
    <div class="content">
        <p>Welcome to TED<sup>x</sup>GIIS Youth, an event featuring inspiring talks from innovative thinkers and leaders.</p>
        <p>Your express pass is ready. Please present the QR code below at check-in on 5 October 2026 for express entry.</p>
        <p>We look forward to seeing you there!</p>
    </div>
    
    <div class="contentq">
        <div class="qr">
            <div class="actualqr"><img src="https://media.sciencephoto.com/image/c0280133/800wm/C0280133-QR_Code_Example.jpg"></div>
        </div>
        <p>Name: <span id="name"></span></p>
        <p>Class: <span id="class"></span></p>
        <p>T-Shirt Size: <span id="size"></span></p>
        
    </div>
</body>
</html>
            `,
            headers: {
                "Importance": "high",
                "X-Priority": "1",
                "X-MSMail-Priority": "High",
            },
        })
        .then(console.log, console.error);
} else {
    console.error('MAILTRAP is not configured; skipping email test.');
} */


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pages = ['/', '/speakers', '/team', '/registration', '/template', '/dash','/qr', '/email'];

pages.forEach((route) => {
    app.get(route, (req, res) => {
        const view = route === '/' ? 'index' : route.slice(1);
        res.render(view, route === '/qr' ? { marked: false, alrmark: false } : undefined);
    });
});

app.post('/mark/:id', async (req, res) => {
    const { id } = req.params;
    const fields = 'id, name, class, email, size, marked';

    try {
        const { data: participant, error: lookupError } = await supabase
            .from('participants')
            .select(fields)
            .eq('id', id)
            .single();

        if (lookupError || !participant) {
            return res.status(404).render('qr', {
                marked: false,
                alrmark: false,
                error: 'Participant not found.'
            });
        }

        if (participant.marked) {
            return res.render('qr', {
                ...participant,
                marked: false,
                alrmark: true
            });
        }

        const { data: markedParticipant, error: markError } = await supabase
            .from('participants')
            .update({ marked: true })
            .eq('id', id)
            .select(fields)
            .single();

        if (markError || !markedParticipant) {
            throw markError || new Error('Participant could not be marked.');
        }

        return res.render('qr', {
            ...markedParticipant,
            marked: true,
            alrmark: false
        });
    } catch (error) {
        console.error('Error marking participant:', error);
        return res.status(500).render('qr', {
            marked: false,
            alrmark: false,
            error: 'Unable to mark participant.'
        });
    }
});

if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log('server is running on port ' + port);
        console.log('http://localhost:' + port);
    });
}

export default app;
