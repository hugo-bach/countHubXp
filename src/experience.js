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

/**
 * @typedef ActivitieType
 * @type {object}
 * @property {number} key
 * @property {string} name
 * @property {number} xpWinPart
 * @property {number} xpWinOrg
 * @property {number} xpLostPart
 * @property {number} limitPart
 * @property {number} limitOrg
 * @property {number} nbPart
 * @property {number} nbOrg
 */

import ora from 'ora';
import chalk from 'chalk';
import { IntraApi } from './intraApi.js';
import { askQuestion } from './ui.js';

const activitiesType = [
  {
    key: 1,
    name: 'Talk',
    xpWinPart: 1,
    xpWinOrg: 4,
    xpLostPart: 1,
    limitPart: 15,
    limitOrg: 6,
    nbPart: 0,
    nbOrg: 0,
  },
  {
    key: 2,
    name: 'Workshop',
    xpWinPart: 2,
    xpWinOrg: 7,
    xpLostPart: 2,
    limitPart: 10,
    limitOrg: 3,
    nbPart: 0,
    nbOrg: 0,
  },
  {
    key: 3,
    name: 'Hackathon',
    xpWinPart: 6,
    xpWinOrg: 15,
    xpLostPart: 6,
    limitPart: 100,
    limitOrg: 100,
    nbPart: 0,
    nbOrg: 0,
  },
];

const me = { nbXps: 0, nbXpsSoon: 0, present: [], absent: [], soon: [] };

/**
 * @param  {string} title
 * @param  {ActivitieType} activType
 * @param  {string} status
 * @param  {string} date
 */
async function addActivite(title, activType, status, date) {
  const { name, limitPart, xpWinPart, xpWinOrg, nbPart, xpLostPart, nbOrg, limitOrg } = activType;

  if (status === 'absent') {
    const isAbsent = await askQuestion(
      `Have you been absent from this activity? : ${title}`,
      false
    );
    if (!isAbsent) status = 'present';
  }

  switch (status) {
    case 'present':
      nbPart < limitPart && (me.nbXps += xpWinPart) && (activType.nbPart += 1);
      me.present.push({ title, type: name, status, date });
      break;
    case 'absent':
      me.nbXps -= xpLostPart;
      me.absent.push({ title, type: name, status, date });
      break;
    case 'organisateur':
      nbOrg < limitOrg && (me.nbXps += xpWinOrg) && (activType.nbOrg += 1);
      me.present.push({ title, type: name, status: 'organisateur', date });
      break;
    case 'soon':
      me.soon.push({ title, type: name, status: 'inscrit', date });
      break;
    default:
      break;
  }
}

function countXpSoon() {
  me.soon.forEach((act) => {
    const findAct = activitiesType.find((elem) => elem.name === act.type);
    const { xpWinPart, limitPart, nbPart } = findAct;
    nbPart < limitPart && (me.nbXpsSoon += xpWinPart) && findAct.nbPart++;
  });
}

/**
 * @param  {IntraApi} api
 * @param  {Config} config
 */
export async function experience(api, config) {
  const spinner = ora().start(chalk.green('Fetch data...'));
  let countryHub = { activites: [] };
  let cityHub = { activites: [] };

  try {
    countryHub = await api.getHubModule(config.country);
  } catch (err) {
    spinner.stop();
    console.error(chalk.redBright.bold(`Fail to fetch ${config.country} Hub module`));
    console.error(chalk.redBright(err));
    spinner.start();
  }
  try {
    cityHub = await api.getHubModule(config.city);
    spinner.stop();
  } catch (err) {
    spinner.stop();
    console.error(chalk.redBright.bold(`Fail to fetch ${config.city} Hub module`));
    console.error(chalk.redBright(err));
  }

  const activities = [...countryHub.activites, ...cityHub.activites].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );

  for (const activite of activities) {
    activite.type_title = activite.type_title || '';
    activite.events = activite.events || [];

    const activType = activitiesType.find((type) => activite.type_title.match(type.name));
    if (!activType) continue;

    for (const event of activite.events) {
      if (event.user_status) {
        await addActivite(activite.title, activType, event.user_status, event.begin);
      } else if (event.assistants?.find((assistant) => assistant.login === config.email)) {
        await addActivite(activite.title, activType, 'organisateur', event.begin);
      } else if (event.already_register) {
        await addActivite(activite.title, activType, 'soon', event.begin);
      }
    }
  }
  countXpSoon();
  console.log(me);
}
