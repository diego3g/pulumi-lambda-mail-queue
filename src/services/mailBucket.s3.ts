import * as aws from '@pulumi/aws';

export const mailBucket = new aws.s3.Bucket('mailBucket')
