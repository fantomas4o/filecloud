#!/bin/bash

# Скрипт за инсталация на FileCloud (Droppy Clone)
# Стартирайте този скрипт на Ubuntu сървъра с sudo

set -e

echo ">>> Обновяване на пакетите..."
apt-get update

echo ">>> Инсталиране на Node.js и NPM..."
apt-get install -y nodejs npm

echo ">>> Създаване на директория /opt/droppy..."
mkdir -p /opt/droppy

echo ">>> Проверка за файлове..."
if [ ! -f "/opt/droppy/package.json" ]; then
    echo "ВНИМАНИЕ: Файловете на приложението липсват в /opt/droppy!"
    echo "Моля, качете файловете от вашия компютър в /opt/droppy преди да продължите с инсталацията на зависимостите."
    echo "Примерна команда (от Windows): scp -r ./* user@10.20.20.17:/opt/droppy/"
    exit 1
fi

echo ">>> Инсталиране на зависимостите..."
cd /opt/droppy
npm install

echo ">>> Настройка на Systemd Service..."
cp /opt/droppy/droppy.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable droppy
systemctl start droppy

echo ">>> Готово! Приложението работи на http://$(hostname -I | awk '{print $1}'):3000"
