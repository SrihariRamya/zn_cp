/* eslint-disable no-console */
const AWS = require('aws-sdk');
const fs = require('fs');

const sts = new AWS.STS();
const { get } = require('lodash');

const filePath = './package.json';

const tenantConfigSecretName = process.env.TENANT_CONFIG_SECRET_NAME;

console.log('tenantConfigSecretName:', tenantConfigSecretName);

const getCrossAccountCredentials = async () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime();
    const parameters = {
      RoleArn: 'arn:aws:iam::056127410564:role/kaay-jenkins',
      RoleSessionName: `zupain-cp-get-tenant-config-${timestamp}`,
    };
    sts.assumeRole(parameters, (error, data) => {
      if (error) reject(error);
      else {
        resolve({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        });
      }
    });
  });
};

async function syncTenantConfig() {
  try {
    // Get the Cross account credentials
    const accessparams = await getCrossAccountCredentials();
    const secretClient = new AWS.SecretsManager({
      region: 'ap-south-1',
      ...accessparams,
    });
    const parameters = {
      Filters: [
        {
          Key: 'name',
          Values: [tenantConfigSecretName],
        },
      ],
      SortOrder: 'asc',
    };
    const secrets = await secretClient.listSecrets(parameters).promise();
    if (!secrets.SecretList.length) {
      console.error('SecretList is empty', secrets);
    }
    const secretNameArray = get(secrets, 'SecretList', [])
      .map((item) => item.Name)
      .sort();
    const secretStringArray = await Promise.all(
      secretNameArray.map(async (item) => {
        const data = await secretClient
          .getSecretValue({ SecretId: item })
          .promise();
        return data.SecretString;
      })
    );
    const secretString = secretStringArray.join('').trim();
    let secretData;
    try {
      secretData = JSON.parse(secretString);
    } catch (error) {
      console.log('Syntax error in secretstring');
    }
    fs.writeFileSync(
      './public/tenant-config-map.json',
      JSON.stringify(secretData),
      'utf-8'
    );
    console.log('config file added successfully!');
  } catch (error) {
    console.error('AWS SDK error', error);
  }
}
syncTenantConfig();

const packageJson = JSON.parse(fs.readFileSync(filePath).toString());
packageJson.buildDate = new Date().getTime();

fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

const jsonData = {
  buildDate: packageJson.buildDate,
};

const jsonContent = JSON.stringify(jsonData);

fs.writeFile('./public/meta.json', jsonContent, 'utf8', (error) => {
  if (error) {
    console.log(
      'An error occured while saving build date and time to meta.json'
    );
    return console.log(error);
  }

  return console.log('Latest build date and time updated in meta.json file');
});
