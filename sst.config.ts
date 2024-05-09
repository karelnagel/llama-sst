/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app() {
    return {
      name: "llama-sst",
      removal: "remove",
      home: "aws",
      providers: { aws: { region: "eu-central-1" } },
    };
  },
  async run() {},
});
