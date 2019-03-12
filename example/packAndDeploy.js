import CfnNested from 'cfn-nested';

(async () => {
  try {
    const cfnNested = new CfnNested('bucket-to-hold-cloudformation', './templates/template.yml', 'StackName');
    const packageLocation = await cfnNested.package();
    console.log('Package Location:', packageLocation);
    const parameters = { TestParam: 'testParam', ParameterTwo: 1 };
    const deployResult = await cfnNested.deploy(parameters);
    console.log('Deployed Status:', deployResult.StackResources[0].ResourceStatus);
    await cfnNested.delete();
    await cfnNested.deleteBucket();
  } catch (e) {
    console.log('Error:', e);
  }
})();
