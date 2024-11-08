// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const fetch = require('node-fetch');
// import express from 'express';
// import bodyParser from 'body-parser';
// import fetch from 'node-fetch';

// const app = express();
// const PORT = 3000;

// app.use(bodyParser.json()); // Parse JSON data from the frontend

// // POST route to handle form submissions
// app.post('/send', async (req, res) => {
//     const { name, email, message } = req.body;

//     const json = JSON.stringify({
//         name,
//         email,
//         message,
//         access_key: '1a115c8c-ffcc-41cf-973b-be26c8c56204'  // Web3Forms API key
//     });

//     try {
//         const response = await fetch('https://api.web3forms.com/submit', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Accept: 'application/json',
//             },
//             body: json,
//         });

//         if (response.ok) {
//             res.json({ status: 'success', message: 'Email sent successfully!' });
//         } else {
//             res.json({ status: 'error', message: 'Email could not be sent.' });
//         }
//     } catch (error) {
//         res.json({ status: 'error', message: 'Error sending email.' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
