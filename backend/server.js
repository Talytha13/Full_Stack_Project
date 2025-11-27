'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// =============================
// 1. BASIC SERVER SETUP
// =============================

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =============================
// 2. MONGODB CONNECTION
// =============================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log('✅ API Server is running on port ' + port);
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
  });


// =============================
// 3. MODELS (Item and Bid)
// =============================

const Schema = mongoose.Schema;

// === Item (from generator) ===
const itemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  isClosed: { type: Boolean, default: false }, // auction is open by default
  createdAt: { type: Date, default: Date.now }, // default is now
});

const Item = mongoose.model('Item', itemSchema);

// === Bid (from generator) ===
const bidSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bid = mongoose.model('Bid', bidSchema);

// =============================
// 4. ITEM ROUTES (/api/items)
// =============================

const itemRouter = express.Router();
app.use('/api/items', itemRouter);

// GET /api/items
// List all items + info about top bid
itemRouter.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    const itemsWithTopBid = await Promise.all(
      items.map(async (item) => {
        const topBid = await Bid.findOne({ itemId: item._id })
          .sort({ amount: -1 })
          .lean();
        return {
          ...item.toObject(),
          topBidAmount: topBid ? topBid.amount : item.startingPrice,
          topBidUserName: topBid ? topBid.userName : null,
        };
      })
    );

    res.json(itemsWithTopBid);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error fetching items', error: String(err) });
  }
});

// GET /api/items/:id
// Item details + bid history (for the bid screen)
itemRouter.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const bids = await Bid.find({ itemId: item._id }).sort({ amount: -1 }).lean();

    res.json({ item, bids });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error fetching item', error: String(err) });
  }
});

// POST /api/items/add
// Create new item (ADMIN)
itemRouter.post('/add', async (req, res) => {
  try {
    const { title, description, imageUrl, startingPrice } = req.body;

    const newItem = new Item({
      title,
      description,
      imageUrl,
      startingPrice,
      currentPrice: startingPrice,
      isClosed: false,
      createdAt: new Date(),
    });

    await newItem.save();
    res.json({ message: 'Item added!', item: newItem });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error adding item', error: String(err) });
  }
});

// PUT /api/items/update/:id
// Update item (if needed)
itemRouter.put('/update/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.title = req.body.title ?? item.title;
    item.description = req.body.description ?? item.description;
    item.imageUrl = req.body.imageUrl ?? item.imageUrl;
    item.startingPrice = req.body.startingPrice ?? item.startingPrice;
    item.currentPrice = req.body.currentPrice ?? item.currentPrice;
    if (typeof req.body.isClosed === 'boolean') {
      item.isClosed = req.body.isClosed;
    }

    await item.save();
    res.json({ message: 'Item updated!', item });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating item', error: String(err) });
  }
});

// DELETE /api/items/delete/:id
// Delete item + related bids
itemRouter.delete('/delete/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await Bid.deleteMany({ itemId: req.params.id });
    res.json({ message: 'Item and related bids deleted.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error deleting item', error: String(err) });
  }
});

// =============================
// 5. BID ROUTES
// =============================

// POST /api/items/:id/bids
// Create bid with validation: bid > current top bid
itemRouter.post('/:id/bids', async (req, res) => {
  try {
    const { userId, userName, amount } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.isClosed) {
      return res.status(400).json({ message: 'Auction is closed for this item' });
    }

    const topBid = await Bid.findOne({ itemId: item._id })
      .sort({ amount: -1 })
      .lean();

    const currentTop = topBid ? topBid.amount : item.startingPrice;

    if (amount <= currentTop) {
      return res
        .status(400)
        .json({ message: 'Bid must be greater than current top bid' });
    }

    const newBid = new Bid({
      itemId: item._id,
      userId,
      userName,
      amount,
      createdAt: new Date(),
    });

    await newBid.save();

    item.currentPrice = amount;
    await item.save();

    res.status(201).json({ message: 'Bid added!', bid: newBid });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error placing bid', error: String(err) });
  }
});

// (Optional) Direct CRUD routes for bids, if needed
const bidRouter = express.Router();
app.use('/api/bids', bidRouter);

// GET /api/bids
bidRouter.get('/', async (req, res) => {
  try {
    const bids = await Bid.find();
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error fetching bids', error: String(err) });
  }
});

// =============================
// 6. ADMIN ROUTES: CLOSE AUCTION, NOTIFY WINNER
// =============================

// POST /api/items/:id/close
itemRouter.post('/:id/close', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.isClosed = true;
    await item.save();

    const topBid = await Bid.findOne({ itemId: item._id })
      .sort({ amount: -1 })
      .lean();

    res.json({
      message: 'Auction closed',
      winner: topBid
        ? {
            userId: topBid.userId,
            userName: topBid.userName,
            amount: topBid.amount,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error closing auction', error: String(err) });
  }
});

// POST /api/items/:id/notify-winner
// Simulate sending an email to the winner
itemRouter.post('/:id/notify-winner', async (req, res) => {
  try {
    const topBid = await Bid.findOne({ itemId: req.params.id })
      .sort({ amount: -1 })
      .lean();

    if (!topBid) {
      return res.status(400).json({ message: 'No bids for this item' });
    }

    // Here would be the integration with a real email service (e.g. SendGrid, Nodemailer, etc.).
    // For now, we only simulate it with a console.log:
    console.log(
      `Simulated email: Congratulations, ${topBid.userName}! You won item ${req.params.id} with a bid of $${topBid.amount}.`
    );

    res.json({ message: 'Winner notified (simulated)' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error notifying winner', error: String(err) });
  }
});

// =============================
// 7. HEALTH CHECK / TEST ROUTE
// =============================

app.get('/', (req, res) => {
  res.send('Silent Auction API is running');
});
