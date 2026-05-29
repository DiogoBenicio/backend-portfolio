#!/bin/sh
set -e
# Seed de dados meteorológicos — chama weather-api diretamente (sem JWT)
# Idempotente: IDs são determinísticos (city-slug + YYYY-MM-DD-HH)

WEATHER_URL="http://weather-api:8080/api/v1/weather"

echo "[seed-weather] Iniciando seed de dados meteorológicos..."

# Calcula datas dos últimos 7 dias (compatível com BusyBox/Alpine)
today_ts=$(date -u +%s)
populated=0
skipped=0

for city in "São Paulo" "Recife" "Manaus" "Curitiba" "Brasília"; do
  for i in $(seq 6 -1 0); do
    ts=$((today_ts - i * 86400))
    d=$(awk -v ts="${ts}" 'BEGIN { print strftime("%Y-%m-%d", ts) }')

    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST -G \
      --data-urlencode "city=${city}" \
      --data-urlencode "date=${d}" \
      "${WEATHER_URL}/populate")

    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
      populated=$((populated + 1))
    else
      skipped=$((skipped + 1))
    fi

    sleep 2
  done
done

echo "[seed-weather] Concluído: ${populated} registros populados, ${skipped} ignorados."
