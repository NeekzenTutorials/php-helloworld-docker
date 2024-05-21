const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 27017;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const DataSchema = new mongoose.Schema({
    some_string: String,
    created_at: { type: Date, default: Date.now }
});

const Data = mongoose.model('Data', DataSchema);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
    const results = await Data.find({});
    res.render('index', { data: results });
});

app.post('/', async (req, res) => {
    const message = req.body.message;
    const count = await Data.countDocuments({});
    if (count < 15) {
        const newData = new Data({ some_string: message });
        await newData.save();
    }
    res.redirect('/');
});

app.get('/delete/:id', async (req, res) => {
    await Data.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.post('/search', async (req, res) => {
    const message = req.body.message;
    const results = await Data.find({ some_string: new RegExp(message, 'i') });
    res.render('search', { data: results, searchQuery: message });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
