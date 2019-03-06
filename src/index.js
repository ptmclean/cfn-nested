import { createFolderIfNotExists, runCommand, sleep } from './utils';

const PACKAGE_DIRECTORY = './packaged';

export default class CfnNested {
  constructor(bucketName, templateFilename, stackName, silent = false) {
    this.bucketName = bucketName;
    this.templateFilename = templateFilename;
    this.stackName = stackName;
    this.packagedTemplate = null;
    this.silent = silent;
  }

  async package() {
    createFolderIfNotExists(PACKAGE_DIRECTORY);
    await this.createBucketIfNotExists();
    const fullPackagePath = `${PACKAGE_DIRECTORY}/${this.templateFilename.replace(/^(\.\/)*/, '')}`;
    const folders = fullPackagePath
      .split('/')
      .slice(0, -1)
      .reduce((a, _command, i, s) => {
        a.push(s.slice(0, i + 1).join('/'));
        return a;
      }, []);

    folders.forEach((folder) => {
      createFolderIfNotExists(folder);
    });
    this.log(`Packaging ${this.templateFilename}`);
    const command = `aws cloudformation package --template-file ${this.templateFilename} --s3-bucket ${this.bucketName} --output-template-file ${fullPackagePath}`;
    await runCommand(command, this.silent);
    this.packagedTemplate = fullPackagePath;
    return this.packagedTemplate;
  }

  async deploy() {
    this.log(`Deploying ${this.stackName}`);
    if (!this.packagedTemplate) {
      throw new Error(`${this.stackName} must be packaged prior to deployment`);
    }
    const deployCommand = `aws cloudformation deploy --template-file ${this.packagedTemplate} --stack-name ${this.stackName}`;
    await runCommand(deployCommand, this.silent);
    return this.describeStack(this.stackName);
  }

  async delete() {
    this.log(`Deleting ${this.stackName}`);
    const deleteCommand = `aws cloudformation delete-stack --stack-name ${this.stackName}`;
    await runCommand(deleteCommand, this.silent);
    // eslint-disable-next-line no-await-in-loop
    while (await this.stackExists(this.stackName)) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    }
  }

  async stackExists() {
    try {
      await this.describeStack(this.stackName);
    } catch (e) {
      return false;
    }
    return true;
  }

  async bucketExists() {
    this.log(`Checking if ${this.bucketName} exists`);
    try {
      const bucketCheckCommand = `aws s3api head-bucket --bucket ${this.bucketName}`;
      await runCommand(bucketCheckCommand, this.silent);
    } catch (e) {
      return false;
    }
    return true;
  }

  async describeStack() {
    this.log(`Describing ${this.stackName}`);
    const describeCommand = `aws cloudformation describe-stack-resources --stack-name ${this.stackName}`;
    const stdout = await runCommand(describeCommand, this.silent);
    return JSON.parse(stdout);
  }

  async deleteBucket() {
    this.log(`Deleting the S3 bucket ${this.bucketName}`);
    const deleteBucketCommand = `aws s3 rb s3://${this.bucketName} --force`;
    await runCommand(deleteBucketCommand, this.silent);
  }

  async createBucketIfNotExists() {
    if (!await this.bucketExists(this.bucketName)) {
      this.log(`Creating ${this.bucketName}`);
      const bucketCreateCommand = `aws s3 mb s3://${this.bucketName}`;
      await runCommand(bucketCreateCommand, this.silent);
    } else {
      this.log(`${this.bucketName} already exists.`);
    }
  }

  log(logString) {
    if (!this.silent) {
      console.log(logString);
    }
  }
}
