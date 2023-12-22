const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const port = 3000;
const CardStatus = require('./Model/model')
const app = express();
const db = require('./connection');
const bodyParser = require('body-parser')
app.use(express.json());
require("dotenv").config({path: '.env'});
app.use(bodyParser.json());

function loadData() {
    const csvFiles = [
        'Sample_Card_Status_Info_-_Pickup.csv',
        'Sample_Card_Status_Info_-_Delivery_exceptions.csv',
        'Sample_Card_Status_Info_-_Delivered.csv',
        'Sample_Card_Status_Info_-_Returned.csv'
    ];

    csvFiles.forEach((csvFile) => {
        const filePath = path.join(__dirname, 'data', csvFile);

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', async (row) => {
                try {
                    const cardStatus = new CardStatus({
                        id: row['CardID'],
                        phone_number: row['PhoneNumber'],
                        status: row['Status']
                    });

                    await cardStatus.save();  // Use 'await' here
                } catch (err) {
                    console.error(`Error saving data for card ${row['CardID']}: ${err}`);
                }
            })
            .on('end', () => {
                console.log(`Data loaded from ${csvFile}`);
            });
    });
}


// Endpoint to get card status
app.get('/get_card_status', async (req, res) => {
const phone_number = req.query.phone_number;
const card_id = req.query.card_id;

if (!phone_number && !card_id) {
    return res.status(400).json({ error: 'Either phone_number or card_id must be provided' });
}

let filter;
if (phone_number) {
    filter = { phone_number: phone_number };
} else {
    filter = { id: card_id };
}

try {
    const cardStatus = await CardStatus.findOne(filter).sort({ timestamp: -1 });

    if (!cardStatus) {
        return res.json({ status: 'Card not found' });
    }

    res.json({
        status: cardStatus.status,
        timestamp: cardStatus.timestamp
    });
} catch (error) {
    console.error(`Error retrieving card status: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
}
});


loadData();

app.listen(()=>{
    console.log(`connected on ${port} port_no`)
})