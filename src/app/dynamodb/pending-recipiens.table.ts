import * as aws from "@pulumi/aws";

export const pendingRecipientsTable = new aws.dynamodb.Table("pending_recipients", {
    attributes: [
      {
        name: "RecipientId",
        type: "S",
      },
    ],
    billingMode: "PAY_PER_REQUEST",
    hashKey: "RecipientId",
});