# Multi-stage Dockerfile for BankingApp backend
# Targets a small final image suitable for GCP Cloud Run or GKE.

FROM python:3.11-slim as builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system build deps for packages like asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first for better layer caching
COPY app/requirements.txt ./

# Create a virtualenv to avoid polluting system python
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Final smaller runtime image
FROM python:3.11-slim as runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8080

# Install only runtime deps (ca-certificates) and create non-root user
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY app ./app

# Ensure permissions
RUN chown -R appuser:appuser /app /opt/venv

USER appuser

# Expose default port expected by GCP Cloud Run
EXPOSE 8080

# Use environment PORT if provided by platform (Cloud Run sets it)
CMD ["sh", "-lc", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
# Backend/Dockerfile
# Python slim base, explicit 3.11 to match many modern apps. Adjust if you need a different version.
FROM python:3.11-slim

# Install system dependencies needed for asyncpg/postgres driver and build
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gcc \
       curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user for safety
RUN useradd --create-home appuser
WORKDIR /home/appuser

# Copy only requirements first for layer caching
COPY app/requirements.txt ./app/requirements.txt

# Use pip to install requirements. Use --no-cache-dir to reduce image size.
RUN python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r app/requirements.txt

# Copy application code
COPY app ./app

# Ensure non-root user owns the app directory and run as that user
RUN chown -R appuser:appuser /home/appuser
USER appuser

# Expose port and set workdir
WORKDIR /home/appuser/app
EXPOSE 8000

# Default command uses uvicorn. In production you might replace with gunicorn + uvicorn workers.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "uvloop", "--workers", "1"]
