const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // console.log("rann")
    // console.log("while clicking on toggle this function shouldnt be running")
    
    // console.log("error from verify token middlewaredrr")

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = verifyToken;
