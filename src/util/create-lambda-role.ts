import * as aws from '@pulumi/aws';

import { PolicyStatement } from '@pulumi/aws/iam/documents';

const defaultLambdaStatement: PolicyStatement = {
  Effect: "Allow",
  Resource: "*",
  Action: [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents",
  ],
};

interface CreateLambdaRoleParams {
  name: string;
  policyStatements?: PolicyStatement[];
}

export function createLambdaRole({
  name, 
  policyStatements = [],
}: CreateLambdaRoleParams) {
  const role = new aws.iam.Role(`${name}-lambda-role`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
  });
  
  const lambdaSESPolicy = new aws.iam.Policy(`${name}-lambda-policy`, {
    path: "/",
    policy: {
      Version: "2012-10-17",
      Statement: policyStatements.concat(defaultLambdaStatement),
    },
  });
  
  const policyAttachment = new aws.iam.RolePolicyAttachment(
    `${name}-lambda-policy-attachment`,
    {
      policyArn: lambdaSESPolicy.arn,
      role: role.name,
    },
  );

  return {
    role,
    policyAttachment,
  };
}