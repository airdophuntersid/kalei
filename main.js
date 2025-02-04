import KaleidoMiningBot from './miner.js'; // Menggunakan import ES Module
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

// Jika ada banner.js, pastikan juga menggunakan export default di file tersebut
import displayBanner from './banner.js';

class MiningCoordinator {
    constructor() {
        this.bots = [];
        this.totalPaid = 0;
    }

    async loadWallets() {
        try {
            const data = await fs.readFile(path.join(process.cwd(), 'wallets.txt'), 'utf8');
            return data.split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('0x'));
        } catch (error) {
            console.error('Error loading wallets:', error.message);
            return [];
        }
    }

    async start() {
        displayBanner();
        const wallets = await this.loadWallets();

        if (wallets.length === 0) {
            console.log(chalk.red('No valid wallets found in wallets.txt'));
            return;
        }

        console.log(chalk.blue(`Loaded ${wallets.length} wallets\n`));

        this.bots = wallets.map((wallet, index) => {
            const bot = new KaleidoMiningBot(wallet, index + 1);
            bot.initialize();
            return bot;
        });

        process.on('SIGINT', async () => {
            console.log(chalk.yellow('\nShutting down miners...'));
            this.totalPaid = (await Promise.all(this.bots.map(bot => bot.stop())))
                .reduce((sum, paid) => sum + paid, 0);

            console.log(chalk.green(`
            === Final Summary ===
            Total Wallets: ${this.bots.length}
            Total Paid: ${this.totalPaid.toFixed(8)} KLDO
            `));
            process.exit();
        });
    }
}

// Jalankan Mining
new MiningCoordinator().start().catch(console.error);
