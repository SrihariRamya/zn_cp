const AWS = require("aws-sdk");
const fs = require("fs");
const { filter, get } = require("lodash");

const tenantConfigSecretName = process.env.TENANT_CONFIG_SECRET_NAME;

console.log("tenantConfigSecretName:", tenantConfigSecretName);

async function syncTenantConfig() {
  try {
    const secretClient = new AWS.SecretsManager({
      region: "ap-south-1",
    });
    const parameters = {
      Filters: [
        {
          Key: "name",
          Values: [tenantConfigSecretName],
        },
      ],
      SortOrder: "asc",
    };
    const secrets = await secretClient.listSecrets(parameters).promise();
    if (!secrets.SecretList.length) {
      console.error("SecretList is empty", secrets);
    }
    const secretNameArray = get(secrets, "SecretList", []).map(
      (item) => item.Name
    ).sort();
    const secretStringArray = await Promise.all(
      secretNameArray.map(async (item) => {
        const data = await secretClient
          .getSecretValue({ SecretId: item })
          .promise();
        return data.SecretString;
      })
    );
    const secretString = secretStringArray.join("").trim();
    let secretData;
    try {
      secretData = JSON.parse(secretString);
    } catch (error) {
      console.log("Syntax error in secretstring");
    }
    fs.writeFileSync(
      "./build/tenant-config-map.json",
      JSON.stringify(secretData),
      "utf-8"
    );
    console.log("config file added successfully!")
  } catch (error) {
    console.error("AWS SDK error", error);
  }
}
syncTenantConfig();
