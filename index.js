const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hwapsgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        const userCollection = client.db("bikePointDb").collection("user");
        const productCollection = client.db("bikePointDb").collection("products");

        // Get User from db:
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        // Add user:
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // add product :
        app.post("/addProduct", async (req, res) => {
            const product = req.body;
            product.createdAt = new Date();
            if (!product) {
                return res.status(404).send({ message: "invalid request" })
            }
            const result = await productCollection.insertOne(product);
            // console.log(product);
            res.send(result)
        });
        // Get All product:
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);

        });


        // DashBoard:
        // set Admin role on db:
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // get admin by email:
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        });


        // Delete user: 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // delete products:
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });


        
        // Update products: 
        app.patch("/products/:id", async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    bikeName: data.bikeName,
                    bikePrice: data.bikePrice,
                    bikeSpecification: data.bikeSpecification,
                    condition: data.condition,
                }
            }

            const result = await productCollection.updateOne(query, updatedDoc);
            res.send(result)

        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('bike point is running');
});

app.listen(port, () => {
    console.log(`bike point is running on port: ${port}`);
});
