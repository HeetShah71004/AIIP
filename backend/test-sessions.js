import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
     const db = mongoose.connection.db;
     const sessions = await db.collection('sessions').find().sort({createdAt: -1}).limit(5).toArray();
     console.log(JSON.stringify(sessions, null, 2));
     process.exit(0);
  });
