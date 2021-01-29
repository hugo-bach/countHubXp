'use strict';

import inquirer from 'inquirer';

/**
 * @param  {string} [message]
 * @returns  {Promise<string>}
 */
export async function askInput(message = '>') {
  const prompted = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
    },
  ]);
  clearLine(true);
  return prompted.input;
}

/**
 * @param  {(input:any,answers?:any)=>string|boolean} validateCallback
 * @param  {string} [message]
 * @returns  {Promise<string>}
 */
export async function askConditionInput(validateCallback, message = '>') {
  const prompted = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
      validate: validateCallback,
    },
  ]);
  clearLine(true);
  return prompted.input;
}

/**
 * @param  {string|number[]} choices
 * @param  {string} [message]
 * @param  {boolean} [returnIndex] return choice index instead of value
 * @returns  {Promise<string|number>}
 */
export async function askList(choices, message = '>', returnIndex = false) {
  const prompted = await inquirer.prompt([
    {
      type: 'list',
      choices: choices,
      name: 'list',
      message,
      pageSize: 10,
    },
  ]);
  clearLine(true);
  if (returnIndex) {
    const idx = choices.findIndex((value) => value === prompted.list);
    return idx;
  }
  return prompted.list;
}

/**
 * @param  {{name:string;value?:any;short?:string}[]} choices
 * @param  {string} [message]
 */
export async function askAdvancedList(choices, message = '>') {
  const prompted = await inquirer.prompt([
    {
      type: 'list',
      choices: choices,
      name: 'list',
      message,
      pageSize: 10,
    },
  ]);
  clearLine(true);
  return prompted.list;
}

/**
 * @returns  {Promise<string>}
 */
export async function askPassword() {
  const prompted = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      mask: '*',
    },
  ]);
  clearLine(true);
  return prompted.password;
}

/**
 * @returns  {Promise<string>}
 */
export async function askEmail() {
  const regex_email = RegExp('([\\w.-]+@([\\w-]+)\\.+\\w{2,})');
  let prompted;

  do {
    prompted = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
      },
    ]);
    clearLine(true);
  } while (!regex_email.test(prompted.email));
  return prompted.email;
}

/**
 * @param  {string[]} choices
 * @param  {any[]} [values]
 * @param  {boolean[]} [checked]
 * @param  {string} [message]
 * @returns  {Promise<any[]>}
 */
export async function askQCM(choices, values = [], checked = [], message = '>') {
  const QCMchoices = choices.map((choice, index) => {
    const c = { name: choice };
    if (values[index] !== undefined) c.value = values[index];
    if (checked[index] !== undefined) c.checked = checked[index];
    return c;
  });

  const prompted = await inquirer.prompt([
    {
      type: 'checkbox',
      choices: QCMchoices,
      name: 'checkbox',
      message,
    },
  ]);
  clearLine(true);
  return prompted.checkbox;
}

/**
 * @param  {string} [message]
 * @param  {boolean} [clearAfterSelection]
 * @returns  {Promise<boolean>}
 */
export async function askQuestion(message = '>', clearAfterSelection = true) {
  const prompted = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
    },
  ]);
  if (clearAfterSelection) clearLine(true);
  return prompted.confirm;
}

/**
 * @param  {boolean} [upLine]
 */
export function clearLine(upLine) {
  process.stdout.clearLine(0);
  if (upLine) {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(0);
  }
}
