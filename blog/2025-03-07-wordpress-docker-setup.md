---
slug: wordpress-docker-setup
title: Dockerizing Wordpress + Redis
authors: fabien
tags: [docker, wordpress, redis, fedora, linux]
---

This is my configuration for Wordpress development with Docker, using Redis as a bonus. I am a [Fedora Linux](https://fedoraproject.org) user, but this should be fine for any OS.

<!-- truncate -->

## Folder structure

```
./app-name/db
  /redis
  /wordpress
  /Dockerfile
  /docker-compose.yml
```

## Dockerfile

The official docker compose from the official Wordpress Docker image would work, but in order to use the Redis extension for Wordpress, we need the PHP pecl redis extension to be installed. To do so, we build a new image from the official one.

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

Add those constants in the `wp-config.php` file:

```php
define('FS_METHOD', 'direct');
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', '6379');
```

You can start up the app: `docker compose up`
