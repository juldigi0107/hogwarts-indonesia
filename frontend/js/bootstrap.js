import {upgradeShell} from './shell.js';
upgradeShell();
await import('./app-v2.js');
