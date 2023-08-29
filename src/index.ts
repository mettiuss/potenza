import 'dotenv/config';
import client from './config.js';

client.login(process.env.TOKEN);
