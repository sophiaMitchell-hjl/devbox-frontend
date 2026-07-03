FROM python:3.13-slim

WORKDIR /app

# 先装依赖(利用构建缓存)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# 生产:监听 0.0.0.0,前置 Nginx/Caddy 反代 + HTTPS
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
