### Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY yarn.lock* ./
RUN apk add --no-cache bash git openssh
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile --prod=false; else npm ci; fi

# Copy source and build
COPY . .
# Build-time args: NODE_ENV and VITE_ prefixed variables are inlined by Vite at build time.
# Provide default for VITE_API_BASE_URL but allow override during docker build.
ARG NODE_ENV=production
ARG VITE_API_BASE_URL="https://bankingapp-backend-140475459295.us-central1.run.app"
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Run the build (yarn or npm). Vite will inline VITE_API_BASE_URL into the built assets.
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

### Production stage: nginx
FROM nginx:1.24-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
