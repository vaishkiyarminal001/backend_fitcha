const express = require("express");
const cors = require("cors");
const { connection } = require("./congfig/db"); // Correct the path to your database configuration
const { userModel } = require("./module/User.model");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

// Serve static files (images)
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 8000;

// Define storage for uploaded files using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the destination folder for uploaded files.
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/post", upload.single("image"), async (req, res) => {
  try {
    const payload = req.body;
    payload.image = req.file.path; // Set the image field to the uploaded file path

    const newNotes = new userModel(payload);
    await newNotes.save();
    res.status(201).json({ message: "Created New Notes", newNotes });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to home");
});

// for gallery
app.get("/gallery", async (req, res) => {
  try {
    const displayPaint = await userModel.find();
    res.json(displayPaint);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/gallery/:id", async (req, res) => {
  try {
    const productId = req.params.id; // Get the 'id' parameter from the URL
    const product = await userModel.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/gallery/:notesId", async (req, res) => {
  const notesId = req.params.notesId;

  try {
    const deletedNote = await userModel.findByIdAndRemove(notesId);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, async () => {
  try {
    await connection();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error:", error);
    console.log("Error!!!!! Not connected to MongoDB");
  }
});