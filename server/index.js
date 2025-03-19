const express = require('express');
const puppeteer = require('puppeteer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

const app = express();

app.use(cors())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ---------------------
// 1. PDF Generation API
// ---------------------

app.get('/generate-pdf', async (req, res) => {
    // Using a base URL so that relative paths for assets resolve correctly.
    const baseURL = req.protocol + '://' + req.get('host') + '/';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <!-- Base URL so that relative asset paths work correctly -->
        <base href="${baseURL}">
        <style>
          body {
            margin: 0;
            height: 100vh;
            background-image: url('assets/bg.jpg');
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .text {
            font-size: 48px;
            color: white;
            text-shadow: 2px 2px 4px #000;
          }
        </style>
      </head>
      <body>
        <div class="text">Hello World</div>
      </body>
    </html>
    `;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        // Set the HTML content and wait until assets are loaded
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate the PDF with the background printed
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });
        await browser.close();

        // Ensure the pdf_copies directory exists
        const dirPath = path.join(__dirname, 'pdf_copies');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        const filePath = path.join(dirPath, 'hello.pdf');
        fs.writeFileSync(filePath, pdfBuffer);
        console.log(`PDF saved to ${filePath}`);

        // Return the PDF in the response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="hello.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer, 'binary');
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// ---------------------
// 2. Download PDF API
// ---------------------

app.get('/download-pdf', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'pdf_copies', 'hello.pdf');
        res.download(filePath, 'hello.pdf', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
        });
    }
    catch (e) {
        console.log(e)
    }
});
// ---------------------
// 3. Latest Mail API (Example)
// ---------------------

app.get('/latest-mail', (req, res) => {
    try {
        const imapConfig = {
            user: 'umerm8809@gmail.com',
            password: 'cnnm vwmp hqqe njar', // This should be your Gmail app password
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        };

        const imap = new Imap(imapConfig);

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        imap.once('ready', function () {
            openInbox((err, box) => {
                if (err) {
                    console.error('Error opening inbox:', err);
                    return res.status(500).send('Error opening mailbox');
                }
                imap.search(['ALL'], (err, results) => {
                    if (err) {
                        console.error('Search error:', err);
                        return res.status(500).send('Error searching mailbox');
                    }
                    if (!results || results.length === 0) {
                        return res.status(404).send('No emails found');
                    }
                    // Get the latest email UID
                    const latestUID = results[results.length - 1];
                    const fetchOptions = { bodies: '', markSeen: false };
                    const fetcher = imap.fetch(latestUID, fetchOptions);

                    fetcher.on('message', function (msg, seqno) {
                        let rawEmail = '';
                        msg.on('body', function (stream, info) {
                            stream.on('data', (chunk) => {
                                rawEmail += chunk.toString('utf8');
                            });
                            stream.once('end', () => {
                                // Parse the raw email using mailparser
                                simpleParser(rawEmail, (err, parsed) => {
                                    if (err) {
                                        console.error('Error parsing email:', err);
                                        return res.status(500).send('Error parsing email');
                                    }
                                    // Construct a JSON object with useful email details
                                    const emailData = {
                                        from: parsed.from,          // sender information
                                        to: parsed.to,              // recipient information
                                        subject: parsed.subject,    // email subject
                                        date: parsed.date,          // date of the email
                                        text: parsed.text,          // plain text version of the email
                                        html: parsed.html,          // HTML version of the email, if any
                                        headers: Object.fromEntries(parsed.headers) // headers as an object
                                    };
                                    res.json(emailData);
                                });
                            });
                        });
                    });

                    fetcher.once('error', function (err) {
                        console.error('Fetch error:', err);
                        res.status(500).send('Error fetching the email');
                    });

                    fetcher.once('end', function () {
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', function (err) {
            console.error('IMAP connection error:', err);
            res.status(500).send('IMAP connection error: ' + err.message);
        });

        imap.once('end', function () {
            console.log('IMAP connection ended');
        });

        imap.connect();
    }
    catch (e) {
        console.log(e)
    }
});


// ---------------------
// Start the Express server
// ---------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
