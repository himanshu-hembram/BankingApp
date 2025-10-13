# Multi-stage Dockerfile for BankingApp backend
# Optimized for GCP Cloud Run / GKE — fixed to use port 8000

# ===== Builder Stage =====
FROM python:3.11-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first (for caching)
COPY app/requirements.txt ./

# Create isolated virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt


# ===== Runtime Stage =====
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy virtual environment and application code
COPY --from=builder /opt/venv /opt/venv
COPY app ./app

# Fix permissions
RUN chown -R appuser:appuser /app /opt/venv
USER appuser

# Expose port 8000
EXPOSE 8000

# Start the app using Uvicorn on port 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
