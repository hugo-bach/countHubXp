'use strict';

/**
 * @typedef Config
 * @type {object}
 * @property {string} autoLogin - auto Login ID.
 * @property {string} email
 * @property {string} location
 * @property {string} country
 * @property {string} city
 */

import chalk from 'chalk';
import ora from 'ora';
import { config as dotenvConfig } from 'dotenv';
import { IntraApi } from './intraApi.js';
import { askConditionInput } from './ui.js';
import { textToCenter, isVerbose, APP_VERSION } from './utils.js';
import { experience } from './experience.js';

export const run = async () => {
  dotenvConfig();
  if (process.argv.length > 2) parseArgs(process.argv);

  if (isVerbose()) {
    const welcomeMsg = textToCenter('Count Hub Xp ' + chalk.grey.italic(`${APP_VERSION}`));
    console.log(welcomeMsg);
    await ping();
  }
  const config = setupConfig();
  const api = await login(config);

  process.stdin.on('keypress', async (str, key) => {
    if (key.ctrl && key.name === 'l') {
      console.clear();
    }
  });

  await experience(api, config);
};

async function ping() {
  const spinner = ora().start(chalk.green('Check Epitech server...'));

  try {
    const time = await IntraApi.ping();
    spinner.succeed(chalk.green('Epitech server up: ') + chalk.cyan(time + 'ms'));
  } catch (err) {
    spinner.stop();
    console.error(chalk.redBright.bold('Epitech server down: ') + err);
    process.exit(2);
  }
}

/**
 * @param  {Config} config
 */
async function login(config) {
  let api = undefined;
  let error = false;

  do {
    if (!config.autoLogin) {
      const loginAnswer = await askConditionInput((input) => {
        if (String(input).match(/[a-z0-9]{40}/)) return true;
        else
          return 'Please enter valid AutoLogin link/number, see https://intra.epitech.eu/admin/autolog';
      }, 'Epitech AutoLogin:');
      config.autoLogin = loginAnswer[0].match(/[a-z0-9]{40}/);
    }

    const spinner = ora().start(chalk.green('Try to login...'));
    try {
      api = new IntraApi({ token: config.autoLogin });
      const user = await api.getUser();
      config.email = user.login || '';
      config.location = user.location || '';
      config.country = config.location.split('/')[0] || '';
      config.city = config.location.split('/')[1] || '';
      error = false;
      spinner.stop();
    } catch (err) {
      spinner.stop();
      console.error(chalk.redBright.bold('Fail to login'));
      console.error(chalk.redBright(err));
      config.token = '';
      error = true;
    }
    break;
  } while (error || !api);

  if (isVerbose()) console.log(chalk.green(`Login with: ${chalk.cyan(config.email)}`));
  return api;
}

/**
 * @returns {Config}
 */
function setupConfig() {
  const autoLogin = process.env.ID_AUTOLOGIN || undefined;

  return { autoLogin, email: '', location: '', country: '', city: '' };
}

/**
 * @param  {string[]} args
 * @returns {void}
 */
function parseArgs(args) {
  if (args[2]) {
    if (args[2] === '-h' || args[2] === '-H' || args[2] === '--help') {
      console.log('See more help at https://github.com/hugo-bach/countHubXp/blob/main/README.md');
      process.exit(0);
    }
    if (args[2] === '-v' || args[2] === '-V' || args[2] === '--version') {
      console.log(APP_VERSION);
      process.exit(0);
    }
    showHelp();
    process.exit(0);
  }
}

/**
 * @returns {void}
 */
function showHelp() {
  ora().info('Invalid option\n  Usage counthubxp -[vh] [OPTION]...');
}
