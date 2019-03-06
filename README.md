# Cloudformation Nested

A promise based library for packaging and deploying nested cloudformation stacks. Currently the aws SDK does not supprt nested stacks. This implementation is a thin wrapper over the AWS cli to provice native javascript support for nested cloudformation stacks.

## Pre-Requisits
This library assumes that AWS cli is installed and configured. It can be installed following the instruction [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html).

to configure create an AWS user with sufficient permissions for your stack/s and configure the cli with...
```
aws configure
```

## Getting Started
The first step is to create a class instance...
```
import cfnNested from 'cfn-nested';
// Or
const cfnNested = require('cfn-nested');

// This will instantiate the class and tie it to the bucket given as a parameter. If the bucket does not exist it is created when package is called on the class.
const cfnNested = new cfnNested('cloudformation-bucket');
```

Packaging creates a deployable template pointing to templates in the s3 bucket provided on instantiation. The template is created in the file system on the relative path ./packaged/
```
let templateLocation;

templateLocation = await cfnNested.package('./templates/template.yml');
// Or
cfnNested.package('./templates/template.yml')
  .then((result, error) => {
    if (error) throw error;
    templateLoctaion = result;
    console.log('Packaged Template:', result);
  });
```

Deployment needs a stack name and the location provided by package.
```
const stackDescription = await cfnNested.deploy('StackName', templateLocation);
// Or
cfnNested.deploy('StackName', templateLocation)
  .then((result, error) => {
    if (error) throw error;
    console.log('Deployment Status', result.StackResources[0].ResourceStatus); //CREATE_COMPLETE
  });
```

## Example
A complete example is provided in the [example](https://github.com/ptmclean/cfn-nested/tree/master/example) folder. To run the example you can run the following commands from the example folder...
```
npm install
npm start
```

## API
