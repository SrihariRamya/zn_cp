const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { S3 } = require('aws-sdk');
const { get } = require('lodash');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// const { parseJSONSafely } = require('./src/shared/function-helper');

const s3 = new S3({
  region: 'ap-south-1',
});

const app = express();

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'build')));

const parseJSONSafely = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.err(error);
    return {};
  }
};

const getS3File = async ({ Bucket, Key }) => {
  const fileData = await s3
    .getObject({ Bucket, Key })
    .promise()
    .catch((e) => console.log(e));
  console.log(
    'get response:',
    parseJSONSafely(fileData.Body.toString('utf-8'))
  );
  return JSON.parse(fileData.Body.toString('utf-8'));
};

app.get('/cp-config', async (request, res) => {
  const getConfig = await getS3File({
    Bucket: process.env.Bucket,
    Key: process.env.Key,
  });
  console.log('hitted config', getConfig);
  fs.writeFileSync(
    './build/tenant-config-map.json',
    JSON.stringify(getConfig),
    'utf-8'
  );

  res.json('config updated successfully');
});

app.get('/*', function (request, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`app is running at ${port}!`);
});