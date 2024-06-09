const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


const allowedOrigins = [process.env.allowedOrigin]; // Replace with your frontend domain

// app.use(cors({
//     origin: function (origin, callback) {
//         // allow requests with no origin
//         // (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     }
// }));
app.use(cors());


app.use(express.json());
//using env
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
// Use your MongoDB URI


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
const FolderSchema = new mongoose.Schema({
    title: String,
    playgrounds: [
        {
            title: String,
            language: String,
            code: String
        }
    ]
});

const Folder = mongoose.model('Folder', FolderSchema);

// Get all folders
app.get('/api/folders', async (req, res) => {
    const folders = await Folder.find();
    res.send(folders);
});

// Add a new folder
app.post('/api/folders', async (req, res) => {
    const folder = new Folder(req.body);
    await folder.save();
    res.send(folder);
});

// Edit folder title
app.put('/api/folders/:id', async (req, res) => {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(folder);
});

// Delete a folder
app.delete('/api/folders/:id', async (req, res) => {
    await Folder.findByIdAndDelete(req.params.id);
    res.send({ success: true });
});

// Add a playground to a folder

app.post('/api/folders/:id/playgrounds', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        
        const playgroundData = req.body;
        
        folder.playgrounds.push(playgroundData);
        await folder.save();
        
        console.log('Updated Folder:', folder);
        res.send(folder);
    } catch (error) {
        console.error('Error adding playground:', error);
        res.status(500).send('Error adding playground');
    }
});


// Edit a playground
app.put('/api/folders/:folderId/playgrounds/:playgroundId', async (req, res) => {
    const folder = await Folder.findById(req.params.folderId);
    const playground = folder.playgrounds.id(req.params.playgroundId);
    Object.assign(playground, req.body);
    await folder.save();
    res.send(folder);
});

// Delete a playground
app.delete('/api/folders/:folderId/playgrounds/:playgroundId', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.folderId);
        folder.playgrounds.pull({ _id: req.params.playgroundId });
        await folder.save();
        res.send(folder);
    } catch (error) {
        console.error('Error removing playground:', error);
        res.status(500).send('Error removing playground');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
