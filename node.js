// app.js

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs'); // Import fs module for file operations

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/deva', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define Mongoose schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate a unique HTML page name based on user's email or username
    const htmlPageName = `${username.replace(/\s/g, '')}_${email.replace(/[@.]/g, '')}.html`;
    
    // You can customize the HTML content here or load a template from another file
    const htmlContent = `<html><head><title>Welcome ${username}</title></head><body><h1>Welcome ${username}</h1><p>This is your custom page.</p></body></html>`;
    
    // Save the HTML content to a file
    fs.writeFileSync(path.join(__dirname, 'public', htmlPageName), htmlContent);

    res.redirect(`/${htmlPageName}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      // Redirect to the user's custom page if logged in successfully
      const htmlPageName = `${user.username.replace(/\s/g, '')}_${user.email.replace(/[@.]/g, '')}.html`;
      res.redirect(`/${htmlPageName}`);
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
