const jwt = require('jsonwebtoken');

// const ADMIN_USER = 'admin';
// const ADMIN_PASS = '1234'; // you can move this to .env

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

exports.login = (req, res) => {
  console.log("login function ran")
  
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '255d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};
