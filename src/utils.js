import fs from 'fs';
import childProcess from 'child_process';
import util from 'util';

export function createFolderIfNotExists(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

export async function runCommand(command) {
  console.log('-'.repeat(process.stdout.columns));
  console.log(`${command}`);
  try {
    const exec = util.promisify(childProcess.exec);
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      console.log(`Failed to call ${command}`, stderr);
      console.log('-'.repeat(process.stdout.columns));
      throw stderr;
    }
    console.log(`\n${stdout}`);
    console.log('-'.repeat(process.stdout.columns));
    return stdout;
  } catch (e) {
    console.log(`Failed to call ${command}`, e);
    console.log('-'.repeat(process.stdout.columns));
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
