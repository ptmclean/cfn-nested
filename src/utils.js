import fs from 'fs';
import childProcess from 'child_process';
import util from 'util';

export function createFolderIfNotExists(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

export async function runCommand(command, silent) {
  if (!silent) console.log('-'.repeat(process.stdout.columns));
  if (!silent) console.log(`${command}`);
  try {
    const exec = util.promisify(childProcess.exec);
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      if (!silent) console.log(`Failed to call ${command}`, stderr);
      if (!silent) console.log('-'.repeat(process.stdout.columns));
      throw stderr;
    }
    if (!silent) console.log(`\n${stdout}`);
    if (!silent) console.log('-'.repeat(process.stdout.columns));
    return stdout;
  } catch (e) {
    if (!silent) console.log(`Failed to call ${command}`, e);
    if (!silent) console.log('-'.repeat(process.stdout.columns));
    throw e;
  }
}

export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
