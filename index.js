const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("doctor is running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-o6iroya-shard-00-00.wymoxsw.mongodb.net:27017,ac-o6iroya-shard-00-01.wymoxsw.mongodb.net:27017,ac-o6iroya-shard-00-02.wymoxsw.mongodb.net:27017/?ssl=true&replicaSet=atlas-puyajh-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db("carDoctor").collection("Servies");
    const bookingCollection = client.db('carDoctor').collection('booking')
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    
    app.get('/services/:id',async(req,res)=>{
       const id = req.params.id;
       console.log(id);
       const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, price: 1, service_id:1,img:1 },
      };
       const query = {_id: new ObjectId(id)}
       const result = await serviceCollection.findOne(query,options)
       res.send(result)
    })

    app.post('/bookings',async(req,res)=>{
       const clientData = req.body;
       console.log(clientData);
       const result = await bookingCollection.insertOne(clientData)
       res.send(result)
    })
    app.get('/bookings',async(req,res)=>{
      let query = {}
      if(req.query?.email){
        query = {email:req.query.email}
      }
       const result = await bookingCollection.find().toArray()
       res.send(result)
          })

        app.delete('/bookings/:id',async(req,res)=>{
          const id = req.params.id;
          const query = {_id:new ObjectId(id)}
          const result = await bookingCollection.deleteOne(query)
          res.send(result);
        })
        app.put('/bookings/:id',async(req,res)=>{
          const id = req.params.id
          const filter = {_id: new ObjectId(id)}
          const updatedBooking = req.body;
          const updateDoc = {
             $set: {
              status: updatedBooking.status
             }
          }
          const result = await bookingCollection.updateOne(filter,updateDoc)
          res.send(result)
        })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`car Doctor is running on port ${port}`);
});
