$env:BUILDX_NO_DEFAULT_ATTESTATIONS = "1"
docker compose -f docker-compose.prod.yml up --build -d
Write-Host "Containers started. Monitoring with docker ps..."
docker ps
