FROM node:19.9.0

WORKDIR /opt/apps/

RUN node --version

RUN npm --version

COPY package*.json .npmrc /opt/apps/

RUN npm install

COPY . /opt/apps

RUN npm run build

COPY ./build/tenant-config-map.json /opt/apps/build/

RUN ls -larth

RUN ls -ltr build/

# RUN apt update

# RUN apt install awscli -y

# RUN aws --version

EXPOSE  80

# ENTRYPOINT [ "./scripts/start_server.sh" ]

# CMD ["sh", "-c", "aws s3 cp s3://zupain-secrets/$BRANCH/cp.json build/tenant-config-map.json --region ap-south-1 && npm start"]

CMD [ "npm","start" ]
