import chalk from 'chalk';

export default function displayBanner() {
    console.log(chalk.white(`

   /$$$$$$  /$$                 /$$
  /$$__  $$|__/                | $$
 | $$  \ $$ /$$  /$$$$$$   /$$$$$$$  /$$$$$$   /$$$$$$   /$$$$$$
 | $$$$$$$$| $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$
 | $$__  $$| $$| $$  \__/| $$  | $$| $$  \__/| $$  \ $$| $$  \ $$
 | $$  | $$| $$| $$      | $$  | $$| $$      | $$  | $$| $$  | $$
 | $$  | $$| $$| $$      |  $$$$$$$| $$      |  $$$$$$/| $$$$$$$/
 |__/  |__/|__/|__/       \_______/|__/       \______/ | $$____/
                                                       | $$
                                                       | $$
                                                       |__/
         /$$   /$$                       /$$
        | $$  | $$                      | $$
        | $$  | $$ /$$   /$$ /$$$$$$$  /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$$
        | $$$$$$$$| $$  | $$| $$__  $$|_  $$_/   /$$__  $$ /$$__  $$ /$$_____/
        | $$__  $$| $$  | $$| $$  \ $$  | $$    | $$$$$$$$| $$  \__/|  $$$$$$
        | $$  | $$| $$  | $$| $$  | $$  | $$ /$$| $$_____/| $$       \____  $$
        | $$  | $$|  $$$$$$/| $$  | $$  |  $$$$/|  $$$$$$$| $$       /$$$$$$$/
        |__/  |__/ \______/ |__/  |__/   \___/   \_______/|__/      |_______/

                   ${chalk.cyan('KALEIDO - TESTNET')}
        ${chalk.cyan('Auto Mining by @AirdropsHuntersID')}
    `));
}
