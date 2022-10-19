import * as dotenv from 'dotenv';
dotenv.config();

import client from './config.js';
import slashInit from './deploy-commands.js';

client.login(process.env.TOKEN);

await slashInit();
