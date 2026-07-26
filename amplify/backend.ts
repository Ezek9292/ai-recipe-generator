import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";
import { auth } from "./auth/resource";

const bedrockRegion = "us-east-1";
const modelId = "anthropic.claude-sonnet-4-5-20250929-v1:0";
const inferenceProfileId = `global.${modelId}`;

const backend = defineBackend({
  auth,
  data,
});

const accountId = Stack.of(backend.data.resources.graphqlApi).account;
const inferenceProfileArn =
  `arn:aws:bedrock:${bedrockRegion}:${accountId}:` +
  `inference-profile/${inferenceProfileId}`;

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  `https://bedrock-runtime.${bedrockRegion}.amazonaws.com`,
  {
    authorizationConfig: {
      signingRegion: bedrockRegion,
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [inferenceProfileArn],
    actions: ["bedrock:InvokeModel"],
  })
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      `arn:aws:bedrock:${bedrockRegion}::foundation-model/${modelId}`,
      `arn:aws:bedrock:::foundation-model/${modelId}`,
    ],
    actions: ["bedrock:InvokeModel"],
    conditions: {
      StringLike: {
        "bedrock:InferenceProfileArn": inferenceProfileArn,
      },
    },
  })
);
