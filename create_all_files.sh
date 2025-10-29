#!/bin/bash

# Backend utilities
cat > backend/src/utils/logger.js << 'EOF'
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});
module.exports = logger;
EOF

# Backend config
cat > backend/src/config/database.js << 'EOF'
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});
module.exports = sequelize;
EOF

# Backend routes - public
cat > backend/src/routes/public.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/coupons', async (req, res) => {
  res.json({ coupons: [] });
});

router.post('/submit', async (req, res) => {
  const { firstName, lastName, email, phone, address, birthDate, couponId } = req.body;
  // Save to database (implement later)
  res.json({ success: false, message: 'Nešto je pošlo po zlu. Molimo pokušajte ponovno sa istim kuponom ili probajte sa drugim.' });
});

module.exports = router;
EOF

# Backend routes - analytics
cat > backend/src/routes/analytics.js << 'EOF'
const express = require('express');
const router = express.Router();

router.post('/track', async (req, res) => {
  // Save analytics event
  res.json({ success: true });
});

module.exports = router;
EOF

# Backend routes - auth
cat > backend/src/routes/auth.js << 'EOF'
const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    res.json({ token: 'dummy-token-for-now' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
EOF

# Backend routes - admin
cat > backend/src/routes/admin.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/victims', async (req, res) => {
  res.json({ victims: [] });
});

router.get('/stats', async (req, res) => {
  res.json({ totalViews: 0, totalClicks: 0, totalSubmits: 0 });
});

module.exports = router;
EOF

# Backend Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
EOF

echo "All backend files created!"
