import axios from 'axios';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

export default class KaleidoMiningBot {
    constructor(wallet, botIndex) {
        this.wallet = wallet;
        this.botIndex = botIndex;
        this.currentEarnings = { total: 0, pending: 0, paid: 0 };
        this.miningState = {
            isActive: false,
            worker: "quantum-rig-1",
            pool: "quantum-1",
            startTime: null
        };
        this.referralBonus = 0;
        this.stats = {
            hashrate: 75.5,
            shares: { accepted: 0, rejected: 0 },
            efficiency: 1.4,
            powerUsage: 120
        };

        this.api = axios.create({
            baseURL: 'https://kaleidofinance.xyz/api/testnet',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://kaleidofinance.xyz/testnet',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
            }
        });
    }

    async initialize() {
        try {
            const regResponse = await this.retryRequest(
                () => this.api.get(`/check-registration?wallet=${this.wallet}`),
                "Registration check"
            );

            if (!regResponse.data.isRegistered) {
                throw new Error('Wallet not registered');
            }

            this.referralBonus = regResponse.data.userData.referralBonus;
            this.currentEarnings = {
                total: regResponse.data.userData.referralBonus || 0,
                pending: 0,
                paid: 0
            };

            this.miningState.startTime = Date.now();
            this.miningState.isActive = true;

            console.log(chalk.green(`[Wallet ${this.botIndex}] Mining initialized successfully`));
            this.startMiningLoop();

        } catch (error) {
            console.error(chalk.red(`[Wallet ${this.botIndex}] Initialization failed:`), error.message);
        }
    }

    async retryRequest(requestFn, operationName, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                if (i === retries - 1) throw error;
                console.log(chalk.yellow(`[${operationName}] Retrying (${i + 1}/${retries})...`));
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
            }
        }
    }

    calculateEarnings() {
        const timeElapsed = (Date.now() - this.miningState.startTime) / 1000;
        return (this.stats.hashrate * timeElapsed * 0.0001) * (1 + this.referralBonus);
    }

    async updateBalance(finalUpdate = false) {
        try {
            const newEarnings = this.calculateEarnings();
            const payload = {
                wallet: this.wallet,
                earnings: {
                    total: this.currentEarnings.total + newEarnings,
                    pending: finalUpdate ? 0 : newEarnings,
                    paid: finalUpdate ? this.currentEarnings.paid + newEarnings : this.currentEarnings.paid
                }
            };

            const response = await this.retryRequest(
                () => this.api.post('/update-balance', payload),
                "Balance update"
            );

            if (response.data.success) {
                this.currentEarnings = {
                    total: response.data.balance,
                    pending: finalUpdate ? 0 : newEarnings,
                    paid: finalUpdate ? this.currentEarnings.paid + newEarnings : this.currentEarnings.paid
                };

                this.logStatus(finalUpdate);
            }
        } catch (error) {
            console.error(chalk.red(`[Wallet ${this.botIndex}] Update failed:`), error.message);
        }
    }

    logStatus(final = false) {
        const statusType = final ? "Final Status" : "Mining Status";
        const uptime = ((Date.now() - this.miningState.startTime) / 1000).toFixed(0);

        console.log(chalk.blue(`
        === [Wallet ${this.botIndex}] ${statusType} ===
        Wallet: ${this.wallet}
        Uptime: ${uptime}s | Active: ${this.miningState.isActive}
        Hashrate: ${this.stats.hashrate} MH/s
        Total: ${chalk.cyan(this.currentEarnings.total.toFixed(8))} KLDO
        Pending: ${chalk.yellow(this.currentEarnings.pending.toFixed(8))} KLDO
        Paid: ${chalk.green(this.currentEarnings.paid.toFixed(8))} KLDO
        Referral Bonus: ${chalk.magenta(`+${(this.referralBonus * 100).toFixed(1)}%`)}
        `));
    }

    async startMiningLoop() {
        while (this.miningState.isActive) {
            await this.updateBalance();
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }

    async stop() {
        this.miningState.isActive = false;
        await this.updateBalance(true);
        return this.currentEarnings.paid;
    }
}
