import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CfnNested from '../src/index';
import { runCommand } from '../src/utils';

chai.use(chaiAsPromised);
const randomString = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

describe('Integration tests', () => {
  describe('package', function test() {
    this.timeout(20000);
    const bucketName = `test-bucket-${randomString()}`;
    const cfnNested = new CfnNested(bucketName, './test/templates/template.yml', 'foobar', true);
    it('should create a package', async () => {
      const packageLocation = await cfnNested.package();
      expect(packageLocation).to.equal('./packaged/test/templates/template.yml');
    });
    after(async () => {
      await cfnNested.deleteBucket();
    });
  });

  describe('deploy', function test() {
    const twoMinutes = 120000;
    this.timeout(twoMinutes);
    const stackName = `Stack-${randomString()}`;
    const bucketName = `test-bucket-${randomString()}`;
    const cfnNested = new CfnNested(bucketName, './test/templates/template.yml', stackName, true);
    const testParam = 'FooBar';
    it('should fail when package not called first', () => {
      expect(cfnNested.deploy()).to.be.rejectedWith(Error);
    });
    it('should deploy a package', async () => {
      await cfnNested.package();
      const deployResult = await cfnNested.deploy({ TestParam: testParam });
      expect(deployResult.StackResources[0].ResourceStatus).to.equal('CREATE_COMPLETE');
    });
    it('should have passed the parameter', async () => {
      const getOutputsCommand = `aws cloudformation describe-stacks --stack-name ${stackName} --query 'Stacks[0].Outputs' --output json`;
      const outputs = JSON.parse(await runCommand(getOutputsCommand, true));
      expect(outputs[0].OutputKey).to.equal('InputOutput');
      expect(outputs[0].OutputValue).to.equal(testParam);
    });
    after(async () => {
      try {
        await cfnNested.delete(stackName);
        await cfnNested.deleteBucket();
      } catch {
        // do nothing
      }
    });
  });
});
