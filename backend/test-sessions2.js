import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
     const db = mongoose.connection.db;
     const sessions = await db.collection('sessions').find().sort({createdAt: -1}).limit(5).toArray();
     fs.writeFileSync('temp.json', JSON.stringify(sessions, null, 2));
     process.exit(0);
  });
