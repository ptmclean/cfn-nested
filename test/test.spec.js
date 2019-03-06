import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CfnNested from '../src/index';

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
    it('should fail when package not called first', () => {
      expect(cfnNested.deploy()).to.be.rejectedWith(Error);
    });
    it('should deploy a package', async () => {
      await cfnNested.package();
      const deployResult = await cfnNested.deploy();
      expect(deployResult.StackResources[0].ResourceStatus).to.equal('CREATE_COMPLETE');
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
