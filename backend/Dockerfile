FROM python:3.11-slim

# -----------------------------
# System dependencies
# -----------------------------
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libu2f-udev \
    libvulkan1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Chrome environment
# -----------------------------
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# -----------------------------
# App setup
# -----------------------------
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# -----------------------------
# Railway port
# -----------------------------
EXPOSE 8000

# -----------------------------
# Start FastAPI CORRECTLY
# -----------------------------
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
