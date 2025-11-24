#!/bin/sh

echo "Aguardando banco de dados..."

sleep 10

echo "Rodando migrações..."
npx prisma migrate deploy

echo "Rodando seed..."
npx prisma db seed

echo "Iniciando aplicação..."
npm run start:dev

