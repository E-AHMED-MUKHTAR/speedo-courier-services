const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


dotenv.config();

const app = express();
const port = process.env.PORT || 1000;


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error(" MongoDB connection error:", err));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));


const uploadRoutes = require("./routes/uploadRoutes");
app.use("/", uploadRoutes);


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
