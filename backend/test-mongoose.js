import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

import Session from './models/Session.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
     const sessionHistory = await Session.find({ status: 'completed' })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(5)
      .select('score createdAt completedAt parsedData company roleLevel interviewRound');
     
     fs.writeFileSync('temp-mongoose.json', JSON.stringify(sessionHistory, null, 2));
     console.log('Done');
     process.exit(0);
  });
