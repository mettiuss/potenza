import * as dotenv from 'dotenv';
dotenv.config();

import client from './config.js';
import slashInit from './deploy-commands.js';

client.login(process.env.TOKEN);

await slashInit();

import express from 'express';
const app = express();
app.get('/', (req, res) => {
	res.send('Hello World!');
});
app.listen(process.env.PORT, () => console.log('listening'));
