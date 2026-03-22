import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import http from 'http';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
     const db = mongoose.connection.db;
     const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId('69b92bcf0ad91e372bf544c4') });
     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
     
     const req = http.request({
       hostname: 'localhost',
       port: 5000,
       path: '/api/v1/analytics/summary?limit=5',
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`
       }
     }, (res) => {
       let data = '';
       res.on('data', chunk => data += chunk);
       res.on('end', () => {
         fs.writeFileSync('temp-api.json', data);
         console.log('HTTP Done');
         process.exit(0);
       });
     });
     
     req.on('error', (e) => {
       console.error(e);
       process.exit(1);
     });
     req.end();
  });
