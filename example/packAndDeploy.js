import CfnNested from 'cfn-nested';

(async () => {
  try {
    const cfnNested = new CfnNested('bucket-to-hold-cloudformation', './templates/template.yml', 'StackName');
    const packageLocation = await cfnNested.package();
    console.log('Package Location:', packageLocation);
    const deployResult = await cfnNested.deploy();
    console.log('Deployed Status:', deployResult.StackResources[0].ResourceStatus);
    await cfnNested.delete();
    await cfnNested.deleteBucket();
  } catch (e) {
    console.log('Error:', e);
  }
})();
