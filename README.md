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
const cfnNested = new cfnNested('cloudformation-bucket', './path/to/template/template.yml', 'MyStackName');
```

Packaging creates a deployable template pointing to templates in the s3 bucket provided on instantiation. The template is created in the file system on the relative path ./packaged/
```
let templateLocation;

templateLocation = await cfnNested.package();
// Or
cfnNested.package()
  .then((result, error) => {
    if (error) throw error;
    templateLoctaion = result;
    console.log('Packaged Template:', result);
  });
```

Once packaged your stack can be deployed...
```
const stackDescription = await cfnNested.deploy();
// Or
cfnNested.deploy()
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

### Constructor
Constructs a new instance of CfnNested.
```
constructor(bucketName: string, templateFilename: string, stackName: string, silent = false: bool)
```
#### Parameters
**bucketName**: Nested cloudformation templates are packaged into intermediate templated that must be stored in a bucket. This is the bucket name to use. The bucket does not need to exist prior to class instantiation. If the bucket does not exist it will be created on the the call of package.  

**templateFilename**: The location of the base cloudformation template to use for this nested stack.  

**stackName**: This is the name of the stack used when deploying or updating the stack.  

**silent**(optional): If true console output is omitted.  

#### Returns
CfnNested: The instance to operate on for this stack.

### Package
Packages the stack.
```
package()
```
#### Returns
string: The location of the packaged cloudformation template

### deploy
Deploys the stack.
```
deploy()
```
#### Returns
object: The JSON parsed output form the [describe-stack](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stack-resource.html) aws cli command for the stack on completion of the stack creation.

### delete
Deletes the nested stack
```
delete()
```
#### Returns
undefined:

### stackExists
Checks for exsistance of the stack
```
stackExists()
```
#### Returns
bool: true if a stack with the given stack name exists in the configured AWS account.

### bucketExists
```
bucketExists()
```
#### Returrns
bool: true if the bucket already exists

### describeStack
Describes the current state of the stack
```
describeStack()
```
#### Returns
object: The JSON parsed output form the [describe-stack](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stack-resource.html) aws cli command for the stack on completion of the stack creation.

### deleteBucket
Deletes the configured bucket.
```
deleteBucket()
```

#### Returns
undefined:

### createBucketIfNotExists
Creates the configured bucket. **Note**. This is called as part of package if the bucket does not already exist.
```
createBucketIfNotExists()
```

#### Returns
undefined:

## Test
The tests are contained in the test directory. They are full end to end integration tests and require the AWS cli to be configured with an account to be run. Once the cli is configured the tests can be run using the command...
```
npm test
```
