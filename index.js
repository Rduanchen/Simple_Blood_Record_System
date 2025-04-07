const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 路由模組
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const deviceTokenRoutes = require('./routes/deviceTokens');

const app = express();
const port = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/device-tokens', deviceTokenRoutes);

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
