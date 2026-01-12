

docker compose up --build
docker compose --profile migrate run --rm migrate  // после удаления тома будет 500, эту команду стартуем
docker compose exec api npm run migrate:docker





docker compose exec api sh -c "DATABASE_URL=mysql://app:app@mysql:3306/erp_aero npm run migrate:docker"
