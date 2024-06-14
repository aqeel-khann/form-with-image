const bodyParser = require("body-parser");
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
const Port = process.env.Port || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/crudReact")
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("db Error", err));

const userInfo = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  filename: {
    type: String,
  },
});
const UserModel = mongoose.model("User", userInfo);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get("/", async (req, res) => {
  const users = await UserModel.find();
  res.status(200).json(users);
});

app.post("/api/upload", upload.single("profileImage"), async (req, res) => {
  const { name, email } = req.body;
  const { filename } = req.file;

  const user = await UserModel.create({
    name,
    email,
    filename,
  });

  res.status(201).json(user);
});

app.put("/api/update/:id", upload.single("profileImage"), async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const filename = req.file ? req.file.filename : undefined;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (filename) {
      user.filename = filename;
    }

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

app.listen(Port, () => console.log(`Server is Created at Port ${Port}`));
