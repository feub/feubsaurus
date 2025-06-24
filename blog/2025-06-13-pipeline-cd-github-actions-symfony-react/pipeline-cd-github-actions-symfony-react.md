---
slug: pipeline-cd-github-actions-symfony-react
title: "Pipeline CD GitHub Actions Symfony/React"
authors: fabien
tags: [deploiement, react, symfony, hosting, github, linux]
---

Ce document explique de façon concise comment mettre en place un pipeline de **déploiement continu** (CD) pour un projet avec un **backend Symfony**, un **frontend React** avec une **base de données MySQL** sur un VPS OVH sous [Rocky Linux](https://rockylinux.org/).

<!-- truncate -->

## Pré-requis

On estime qu'il y a déjà un serveur web fonctionnel, dans mon cas, il s'agit de [Caddy](https://caddyserver.com/) faisant office de reverse proxy. Ce document ne parle pas non plus de la construction des fichiers dockerfile, on suppose qu'ils sont fonctionnels.

Voici donc ce qu'il faut pour mettre en place ce pipeline :

- Un serveur avec un accès SSH (VPS, serveur dédié, etc)
- Une application conteneurisée comme expliqué en intro
- Un dépôt Git pour le site est question
- Un compte DockerHub
- Être à l'aise avec le Terminal, il faut juste quelques notions de Bash

L'application est structurée comme ceci :

```
apache/
backend/
client/
    Dockerfile
etc/
mysql/
php/
    Dockerfile
```

Pour la partie création d'une paire de clés SSH pour GitHub Actions, se reporter au tutoriel [Pipeline CD avec GitHub Actions sur un VPS](/blog/pipeline-cd-github-actions-vps).

Note : je suis utilisateur de machines Linux _RMP-based_, ici Rocky Linux, ça n'a pas grande importance ici sauf pour la partie webhook plus bas.

## Construire les images docker

Construction des images Docker pour le backend Symfony et le frontend React. Se placer à la racine du projet :

```sh
docker build -t project-backend -f php/Dockerfile .
docker build -t project-frontend-react -f client/Dockerfile .
```

S'il y a des soucis avec le cache Docker, il est possible d'utiliser l'option `--no-cache`.

## Tester les conteneurs

On pourrait maintenant tester le fonctionnement des images en local. Mais il n'est pas possible (facilement) de tester les conteneurs en isolation car le backend doit être connecté à la base de données, il y a des volumes qui sont normalement montés dans le docker compose et la configuration réseau est également spécifique.

```sh
docker run -d --name project-symfony -p 80:80 project-backend
docker run -d --name project-react -p 3000:3000 project-frontend-react
```

## Pusher les images sur Dockerhub

### Tagguer les images

```sh
docker tag project-backend:latest feub/project-backend:latest
docker tag project-frontend-react:latest feub/project-frontend-react:latest
```

### Pusher les images

Si ce n'est pas fait, il faut déjà s'authentifier sur DockerHub :

```sh
docker login
```

Et suivre les instructions.
On peut alors pousser les images :

```sh
docker push feub/project-backend:latest
docker push feub/project-frontend-react:latest
```

## GitHub Actions

### DockerHub Token

Pour que GitHub Actions puisse se connecter à DockerHub, il lui faut un token. On va alors se connecter sur Dockerhub, puis aller dans **Settings > Personal Access Tokens** et ajouter un nouveau token d'accès (read & write) appelé `DOCKERHUB_TOKEN`. ATTENTION, bien le copier car il n'est visible qu'une seule fois.

### GitHub Actions variables

Pour des variables moins sensibles nécessaires au build-time, comme `VITE_API_URL` par exemple, les ajouter dans le projet GitHub sous **Settings > Secrets and variables >Variables > New repository variable**.

### Fichier YAML

Il est temps d'écrire le fichier YAML GitHub Actions. Dans le projet, créer un fichier YAML (je l'ai appelé `build-prod.yaml`) dans le répertoire `.github/workflows` à la racine du projet :

```yaml
name: Build and Push Libtrack Docker Images

on: [workflow_dispatch]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: feub
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Build and push backend
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./php/Dockerfile
          push: true
          tags: feub/project-backend:latest

      # Build and push frontend
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./client/Dockerfile
          build-args: |
            VITE_API_URL=${{ vars.API_URL }}
          push: true
          tags: feub/project-frontend-react:latest
```

La ligne `on: [workflow_dispatch]` permet de garder la main sur les actions, dès qu'il y a un changement poussé vers GitHub, un bouton permet d'exécuter le workflow. Pour exécuter les action par exemple sur chaque push vers main, changer avec :

```yaml
on:
  push:
    branches: ["main"]
```

Dès lors, lorsque des changements arriveront sur la branche main (typiquement une PR de dev vers main), le workflow s'exécutera.

## Webhook et script bash

Pour totalement automatiser le déploiement, on va utiliser la fonctionnalité de webhook que DockerHub propose. Le principe est simple : lorsque les nouvelles images sont poussées sur DockerHub, celui-ci va pinger une URL sur le serveur qui va exécuter un script (bash) faisant un docker compose down, pull des nouvelles images, puis compose up.

Note : Il existe l'outil [webhook](https://github.com/adnanh/webhook) qui permet de lier un endpoint à un script bash, malheureusement il n'y a pas de package RPM (utilisateurs Ubuntu/Debian profitez-en). On va donc mettre en place un serveur web tout simple en Python qui ne sera utilisé que pour ça.

### Simple serveur HTTP Python

Le serveur utilisera le port 8088 et écoutera la route **/webhookrrghu67kjhe5** en POST. Créer le fichier `/opt/webhook-server.py` :

```py
#!/usr/bin/env python3
import subprocess
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhookrrghu67kjhe5':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)

                logging.info("Webhook received, triggering deployment")

                # Run your deployment script
                result = subprocess.run(['/path/to/bash/script/fetch-and-deploy.sh'],
                                      capture_output=True, text=True, check=True)

                logging.info(f"Deployment successful: {result.stdout}")

                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'Deployment triggered successfully')

            except subprocess.CalledProcessError as e:
                logging.error(f"Deployment failed: {e.stderr}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'Deployment failed: {e.stderr}'.encode())
            except Exception as e:
                logging.error(f"Error: {str(e)}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'Error: {str(e)}'.encode())
        else:
            self.send_response(404)
            self.end_headers()

     def log_message(self, format, *args):
        # Suppress default HTTP logging
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8088), WebhookHandler)
    logging.info("Webhook server started on port 8088")
    server.serve_forever()
```

### Tester le serveur

```
chmod +x /opt/webhook-server.py
python3 /opt/webhook-server.py
```

Le message suivant devrait s'afficher :

`2025-06-13 08:49:26,282 - Webhook server started on port 8088`

Tester avec cUrl :

`curl -X POST http://localhost:8088/webhookl1btrAck -d '{"test": "data"}' -H "Content-Type: application/json"`

### Ajouter un service Systemd

Créer le fichier `/etc/systemd/system/webhook-deployment.service` :

```
[Unit]
Description=Docker Hub Webhook Deployment Service
After=network.target

[Service]
Type=simple
User=aman
ExecStart=/usr/bin/python3 /opt/webhook-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Puis activer et démarrer le service :

```
sudo systemctl daemon-reload
sudo systemctl enable webhook-deployment
sudo systemctl start webhook-deployment
```

### Script bash

Voici le script bash (ici appelé `fetch-and-deploy.sh`) qui sera exécuté par le webhook :

```sh
#!/bin/sh
docker compose -f docker-compose.prod.yaml down && \
    docker compose -f docker-compose.prod.yaml pull && \
    docker compose -f docker-compose.prod.yaml up -d;
```

### Caddy (reverse proxy)

Ajouter un handle à Caddy pour que DockerHub puisse atteindre le serveur web Python au travers du reverse proxy Caddy :

```
handle /webhookrrghu67kjhe5 {
     reverse_proxy localhost:8088
}
```

Pour info, voici le contenu complet du Caddyfile :

```
project.net {
        # Symfony backend
        handle /api/* {
                reverse_proxy localhost:8080 {
                        header_up X-Forwarded-Port {server_port}
                        header_up X-Real-IP {remote_host}
                }
        }

        # webhook endpoint
        handle /webhookl1btrAck {
                reverse_proxy localhost:8088
        }

        # frontend client
        handle {
                reverse_proxy localhost:3000
        }

        # security headers
        header {
                # HSTS
                Strict-Transport-Security max-age=31536000;
                # Prévention du clickjacking
                X-Frame-Options DENY
                # Protection XSS
                X-Content-Type-Options nosniff
                # Référence policy
                Referrer-Policy strict-origin-when-cross-origin
        }

        encode gzip

        log {
                output file /var/log/caddy/prject.net.log {
                        roll_size 10MiB
                        roll_keep 5
                        roll_keep_for 720h
                }
        }
}
```

Valider la configuration caddyfile :

`sudo caddy validate --config /etc/caddy/vhosts/project.net --adapter caddyfile`

Le redémarrer :

`sudo systemctl restart caddy`

## Résumé

Ce pipeline fonctionne :

- Je _push_ sur _dev_
- La _PR_ est validée et _merge_ sur _main_
- _GitHub Actions_ se met en branle
- Les _images_ (backend + frontend) sont construites et poussées sur _DockerHub_
- DockerHub via un _webhook_ ping mon petit serveur HTTP en Python dédié au webhook
- Le script _bash_ est exécuté
- Celui-ci exécute la séquence :
  - docker compose down,
  - pull les nouvelles images,
  - compose up
- Le site est à jour
