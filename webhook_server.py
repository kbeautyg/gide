from fastapi import FastAPI, Request, HTTPException
import subprocess
import os
import hmac
import hashlib

# Простой сервер для приема вебхука от GitHub/GitLab
app = FastAPI()

# Секрет, который вы укажете в настройках вебхука GitHub
# Лучше вынести в переменную окружения
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "my_super_secret_key")
DEPLOY_SCRIPT_PATH = "/var/www/gide/deploy.sh"

def verify_signature(request: Request, payload: bytes):
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    expected_signature = "sha256=" + hmac.new(
        key=WEBHOOK_SECRET.encode(), 
        msg=payload, 
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

@app.post("/webhook")
async def handle_webhook(request: Request):
    payload = await request.body()
    
    # Проверка подписи (опционально, но рекомендуется)
    # verify_signature(request, payload)
    
    # Запуск скрипта деплоя
    try:
        result = subprocess.run(
            ["bash", DEPLOY_SCRIPT_PATH], 
            capture_output=True, 
            text=True
        )
        if result.returncode == 0:
            return {"status": "success", "output": result.stdout}
        else:
            return {"status": "error", "error": result.stderr}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Запускаем на порту, отличном от основного приложения (например, 9000)
    uvicorn.run(app, host="0.0.0.0", port=9000)


