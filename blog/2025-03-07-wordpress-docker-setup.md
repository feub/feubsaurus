---
slug: wordpress-docker-setup
title: "Setup Wordpress + Redis avec Docker"
authors: fabien
tags: [docker, wordpress, redis, fedora, linux]
---

Ceci est mon setup de développement Wordpress avec Docker et Redis en bonus. Je suis un utilisateur [**Fedora Linux**](https://fedoraproject.org), mais ça devrait fonctionner avec tout autre OS.

<!-- truncate -->

## Structure des répertoires

Le projet Wordpress sera organisé comme ceci :

```
./app-name/db
  /redis
  /wordpress
  /Dockerfile
  /docker-compose.yml
```

## Dockerfile

Le docker compose à partir de l’image officielle de Wordpress Docker fonctionnerait, mais afin d’utiliser l’extension Redis, nous avons besoin que l'extension PHP pecl redis soit installée. Pour ce faire, nous construisons une nouvelle image à partir de l’image officielle.

```yaml
FROM wordpress

# Install Redis extension
RUN apt-get update && apt-get install -y \
  && pecl install redis \
  && docker-php-ext-enable redis

# Add permission handling (use your Fedora user's UID/GID)
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN usermod -u ${USER_ID} www-data && groupmod -g ${GROUP_ID} www-data

# Ensure the web server can write to the WordPress directory
RUN chown -R www-data:www-data /var/www/html
```

## Docker compose

```yaml
services:

  wordpress:
    #image: wordpress
    build: ./wordpress
    restart: always
    ports:
      - 8080:80
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: exampleuser
      WORDPRESS_DB_PASSWORD: examplepass
      WORDPRESS_DB_NAME: exampledb
    volumes:
      - ./wordpress:/var/www/html
    depends_on:
      - db

  redis:
    image: redis:latest
    hostname: redis
    container_name: redis
    restart: always
    expose:
      - 6379
    command:
      - redis-server
      - --save 60 1
      - --loglevel warning
      - --maxmemory 128mb
      - --maxmemory-policy allkeys-lru
    volumes:
      - ./redis:/var/lib/redis
      - ./redis/data:/data
      #- ./redis.conf:/usr/local/etc/redis/redis.conf
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: exampledb
      MYSQL_USER: exampleuser
      MYSQL_PASSWORD: examplepass
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - ./db:/var/lib/mysql

  volumes:
  wordpress:
  db:
  redis:
```

## wp-config.php

Ajouter ces constantes au fichier `wp-config.php` :

```php
define('FS_METHOD', 'direct');
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', '6379');
```

La stack peut être démarrée avec `docker compose up` 🚀
