const { MongoClient } = require("mongodb");
const cors = require('cors');
const http = require("http");
require('dotenv').config();

async function run() {
    // MongoDB Connection Setup
    const uri = process.env.DB_URI; // Replace with your MongoDB Atlas URI

    const client = new MongoClient(uri);

    // Connect to MongoDB
    await client.connect();
    const database = client.db("ddt"); // Replace with your database name
    const collection = database.collection("data"); // Replace with your collection name

    const server = http.createServer(async (req, res) => {
        if (req.method === "POST" && req.url === "/addData") {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const jsonData = JSON.parse(body);
                    // Insert received data into MongoDB
                    const insertResult = await collection.insertOne(jsonData);

                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ message: 'Data added successfully', insertedCount: insertResult.insertedCount }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    return;
                }
            });
        } else if (req.method === "GET" && req.url === "/getData") {
            try {
                const query = {}; // Define your query if needed
                const cursor = await collection.find(query);
                const data = await cursor.toArray();

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify(data));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        } else if (req.method === 'GET' && req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Server is running successfully!</h1>');
        }else if (req.method === 'DELETE' && req.url === '/deleteData') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const jsonData = JSON.parse(body);
                    const { _id } = jsonData;

                    if (!_id) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'No ID provided' }));
                        return;
                    }
                    // Delete data from MongoDB by _id
                    const deleteResult = await collection.deleteOne({ _id });

                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ message: 'Data deleted successfully', deletedCount: deleteResult.deletedCount }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    return;
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    })

    server.listen(3000, () => {
        console.log('Server running at http://localhost:3000/');
    });
}

run().catch(console.dir);
