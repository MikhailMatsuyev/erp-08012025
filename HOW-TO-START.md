

docker compose up --build
docker compose --profile migrate run --rm migrate
docker compose exec api npm run migrate:docker





docker compose exec api sh -c "DATABASE_URL=mysql://app:app@mysql:3306/erp_aero npm run migrate:docker"
