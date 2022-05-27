import * as aws from '@pulumi/aws';

export const sendMailQueue = new aws.sqs.Queue('sendMailQueue', {
  visibilityTimeoutSeconds: 30,
})