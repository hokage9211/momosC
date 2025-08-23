require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const cors=require("cors")
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// billerCode
const statusRoutes = require('./billerRoutes/statusRoutes')
app.use('/api/bills', require('./billerRoutes/bills'));
app.use('/api/status', statusRoutes);  // Section 3 actions






const authRoutes = require('./routes/authRoutes');


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));
app.use('/api/auth', authRoutes);

app.use('/api/admin', require('./routes/adminRoutes'));
app.get('/api/health', (req, res) => {
  res.status(200).send('OKkk running');
});


app.get('/', (req, res) => {
    res.redirect('/admin.html');
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Load Cron Job (automatically schedules itself)
// for replit
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));





//  function showToast(message) {
//         const toast = document.getElementById("toast");
//         toast.textContent = message;
//         toast.style.display = "block";
//         setTimeout(() => (toast.style.display = "none"), 3000);
//       }