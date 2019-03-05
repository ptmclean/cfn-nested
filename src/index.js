import { createFolderIfNotExists, runCommand, sleep } from './utils';

const PACKAGE_DIRECTORY = './packaged';

export default class CfnNested {
  constructor(bucketName) {
    this.bucketName = bucketName;

    createFolderIfNotExists(PACKAGE_DIRECTORY);

    this.deploy = async (stackName, packagedTemplate) => {
      console.log(`Deploying ${stackName}`);
      const deployCommand = `aws cloudformation deploy --template-file ${packagedTemplate} --stack-name ${stackName}`;
      await runCommand(deployCommand);
      return this.describeStack(stackName);
    };

    this.delete = async (stackName) => {
      console.log(`Deleting ${stackName}`);
      const deleteCommand = `aws cloudformation delete-stack --stack-name ${stackName}`;
      await runCommand(deleteCommand);
      // eslint-disable-next-line no-await-in-loop
      while (await this.stackExists(stackName)) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(5000);
      }
    };

    this.stackExists = async (stackName) => {
      try {
        await this.describeStack(stackName);
      } catch (e) {
        return false;
      }
      return true;
    };

    this.bucketExists = async (name) => {
      console.log(`Checking if ${name} exists`);
      try {
        const bucketCheckCommand = `aws s3api head-bucket --bucket ${name}`;
        await runCommand(bucketCheckCommand);
      } catch (e) {
        return false;
      }
      return true;
    };

    this.describeStack = async (stackName) => {
      console.log(`Describing ${stackName}`);
      const describeCommand = `aws cloudformation describe-stack-resources --stack-name ${stackName}`;
      const stdout = await runCommand(describeCommand);
      return JSON.parse(stdout);
    };
  }


  async deleteBucket() {
    console.log(`Deleting the S3 bucket ${this.bucketName}`);
    const deleteBucketCommand = `aws s3 rb s3://${this.bucketName} --force`;
    await runCommand(deleteBucketCommand);
  }

  async createBucketIfNotExists() {
    if (!await this.bucketExists(this.bucketName)) {
      console.log(`Creating ${this.bucketName}`);
      const bucketCreateCommand = `aws s3 mb s3://${this.bucketName}`;
      await runCommand(bucketCreateCommand);
    } else {
      console.log(`${this.bucketName} already exists.`);
    }
  }

  async package(templateFilename) {
    await this.createBucketIfNotExists();
    const fullPackagePath = `${PACKAGE_DIRECTORY}/${templateFilename.replace(/^(\.\/)*/, '')}`;
    const folders = fullPackagePath
      .split('/')
      .filter(x => x !== '.')
      .slice(0, -1)
      .reduce((a, _c, i, s) => {
        a.push(s.slice(0, i + 1).join('/'));
        return a;
      }, []);

    folders.forEach((folder) => {
      createFolderIfNotExists(folder);
    });
    console.log(`Packaging ${templateFilename}`);
    const command = `aws cloudformation package --template-file ${templateFilename} --s3-bucket ${this.bucketName} --output-template-file ${fullPackagePath}`;
    await runCommand(command);
    return fullPackagePath;
  }
}
