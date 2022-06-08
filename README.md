# api-express

Перед запуском необходимо прописать следющую команду:
```
*npm install*
```
Также необходимо прописать конфигурацию (создайте файл "*.env*") подключения к базе данных (при разработке использовалась MariaDB 10.6.x).
```
MYSQL_HOST="localhost"
MYSQL_USER="library"
MYSQL_DBNAME="library"
MYSQL_PASS="library"

SSL_ENABLED=0
SSL_KEY="privkey.pem"
SSL_CERT="cert.pem"
```
После установки необходимых пакетов и правок конфигурации запускаем проект следующей командой:
```
*npm run dev*
```
API-сервер работает на портах:
```
8911 (http)

8912 (https) //*только если в файле конфигурации указаны пути до файлов сертификата*
```
Следующая команда соберет исходники API-сервера в EXE:
```
npm run build
```

--------------------------------

Базу данных можно скачать с моего сайта: http://thomas-norris.ru/uploads/library.zip
