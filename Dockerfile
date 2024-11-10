# Use an official Node runtime as the base image
FROM node:20.10.0

# # 安装 pnpm
# RUN npm install -g pnpm

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and pnpm-lock.yaml files to the container
COPY package.json pnpm-lock.yaml Dockerfile ./
# COPY src/prisma ./src/prisma/
# COPY src/assets/iconify-icons/generated-icons.css ./src/assets/iconify-icons/generated-icons.css
COPY src/assets ./src/assets/

# Install all the dependencies
RUN yarn

# Copy all the files from your local machine to the Docker environment
COPY . .

# # 生成 Prisma 客户端
# RUN pnpm prisma generate

# Build nextjs
# yarn build
RUN node --max-old-space-size=102400 node_modules/.bin/next build

CMD ["yarn", "start", "--port", "8210"]
