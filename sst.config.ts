/// <reference path="./.sst/platform/config.d.ts" />

import * as docker from "@pulumi/docker";
import * as apigateway from "@pulumi/aws-apigateway";

export default $config({
  app() {
    return {
      name: "llama-sst",
      removal: "remove",
      home: "aws",
      providers: { aws: { region: "eu-central-1" } },
    };
  },
  async run() {
    const repo = new aws.ecr.Repository("Repository", { name: "llama-sst" });

    repo.repositoryUrl.apply(console.log);

    repo.registryId.apply(async (registryId) => {
      const creds = await aws.ecr.getAuthorizationToken({ registryId });
      const image = new docker.Image("Image", {
        build: {
          context: "/Users/karel/Documents/llama-sst",
          platform: "linux/amd64",
        },
        imageName: repo.repositoryUrl,
        registry: {
          server: repo.repositoryUrl,
          username: creds.userName,
          password: creds.password,
        },
      });

      const role = new aws.iam.Role("Role", {
        assumeRolePolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
        managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"],
      });

      const lambdaFunction = new aws.lambda.Function("Function", {
        packageType: "Image",
        imageUri: $interpolate`${image.imageName}:latest`,
        role: role.arn,
        imageConfig: {
          entryPoints: ["index.handler"],
        },
      });
      const api = new apigateway.RestAPI("RestApi", {
        stageName: "dev",
        routes: [{ path: "/", method: "GET", eventHandler: lambdaFunction }],
      });
      api.url.apply(console.log);
    });
  },
});
