const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// ✅ Models
const User = require("./models/user"); // Assuming this file exists
// ✅ Transaction Schema Definition
const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  scenario: { type: String, required: true },
  eveAttack: { type: Boolean, required: true },
  status: { type: String, required: true },
  finalKey: { type: String, required: true },
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// ------------------------- AUTH ROUTES -------------------------

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Check if username exists
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    await new User({ fullName, username, email, password: hashedPassword }).save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Signin
app.post("/api/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid username" });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: user.username,
      fullName: user.fullName,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------- TRANSACTION ROUTES -------------------------

// Save new transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const { amount, scenario, eveAttack, status, finalKey, username } = req.body;

    const transaction = new Transaction({
      amount,
      scenario,
      eveAttack,
      status,
      finalKey,
      username,
    });

    await transaction.save();
    res.json({ message: "Transaction saved successfully", transaction });
  } catch (err) {
    console.error("Error saving transaction:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions (for Admin page or history)
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------- DEFAULT ROUTE -------------------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ------------------------- START SERVER -------------------------

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
