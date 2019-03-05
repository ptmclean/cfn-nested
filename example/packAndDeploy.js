import CfnNested from 'cfn-nested';

(async () => {
  try {
    const stackName = 'MyStackName';
    const cfnNested = new CfnNested('mc-cloudformation-bucket-2');
    const packagedTemplate = await cfnNested.package('./templates/template.yml');
    const deployResult = await cfnNested.deploy(stackName, packagedTemplate);
    console.log('Deployed Status:', deployResult.StackResources[0].ResourceStatus);
    await cfnNested.delete(stackName);
    await cfnNested.deleteBucket();
  } catch (e) {
    console.log('Error:', e);
  }
})();
