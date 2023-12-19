const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'environment', '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(bodyParser.json());

async function connectToDatabase() {
    const uri = process.env.DB_URI;
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db('ddt');
    return database.collection('data');
}

app.post('/addData', async (req, res) => {
    const collection = await connectToDatabase();
    try {
        const insertResult = await collection.insertOne(req.body);
        res.status(200).json({
            message: 'Data added successfully',
            insertedCount: insertResult.insertedCount,
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
    }
});

app.get('/getData', async (req, res) => {
    const collection = await connectToDatabase();
    try {
        const query = {}; // Define your query if needed
        const data = await collection.find(query).toArray();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/deleteData', async (req, res) => {
    const collection = await connectToDatabase();
    try {
        const _id = req.body._id;
        if (!_id) {
            res.status(400).json({ error: 'No ID provided' });
            return;
        }

        const deleteResult = await collection.deleteOne({_id: new ObjectId(_id)});
        res.status(200).json({
            message: 'Data deleted successfully',
            deletedCount: deleteResult.deletedCount,
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
    }
});

app.patch('/updateData/:id', async (req, res) => {
    const collection = await connectToDatabase();
    try {
        const _id = req.params.id;
        if (!_id) {
            res.status(400).json({ error: 'No ID provided' });
            return;
        }

        const updateResult = await collection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: req.body }
        );
        if (updateResult.matchedCount > 0) {
            res.status(200).json({
                message: 'Data updated successfully',
                modifiedCount: updateResult.modifiedCount,
            });
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
    }
});

// Handling OPTIONS request for CORS
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
