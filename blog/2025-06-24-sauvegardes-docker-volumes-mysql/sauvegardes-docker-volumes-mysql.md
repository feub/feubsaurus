---
slug: sauvegardes-docker-volumes-mysql
title: "Sauvegardes de volumes et de base de données (MySQL) Docker"
authors: fabien
tags: [database, docker, bash, linux]
---

**Docker** est très bien pour le développement, c'est encore mieux en production, mais il faut alors ne pas négliger la question des **sauvegardes**. C'était un peu la question du jour pour mes besoins personnels, j'ai donc pris un peu de temps pour dégrossir ce point.

C'est un peu plus compliqué que des sauvegardes fichiers + dump classiques, mais cela reste plutôt simple (lorsque tout va bien). Ici je ne vais parler que de deux choses : sauvegarde de volumes (named volumes) et dump de base de données. En gros, les données qui doivent persister.

En bonus, le script bash que j'utilise désormais sur mon VPS.

<!-- truncate -->

## Sauvegarde d'un volume

Pour l'exemple, imaginons que dans une application dockerisée, un volume s'appelle `images_data`, afin de persister des fichiers images. Dans le fichier YAML docker compose, ce volume est précisé avec quelque chose comme ça :

```yaml
volumes:
  - images_data:/var/www/public/images
```

_Note_ : lorsque la stack est démarrée, le nom du volume est souvent préfixé avec le nom du projet (pour vérifier on peut inspecter le conteneur avec `docker inspect nom-du-conteneur | grep -A 10 -B 10 "images_data"`, le nom complet va alors ressortir). Dans mon exemple, le volume sera `monapp_images_data`.

```sh
docker run --rm \
  -v monapp_images_data:/data \
  -v /home/utilisateur/backups:/backup \
  --user "$(id -u):$(id -g)" \
  alpine \
  tar czf /backup/images_data-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

Cette commande :

- Crée un conteneur temporaire basé sur Alpine
- Monte le volume images_data sur /data dans le conteneur
- Monte le répertoire de sauvegarde sur /backup
- Fait en sorte que l'utilisateur sera celui de l'hôte (et pas root)
- Crée une archive compressée tar avec un timestamp
- Supprime le conteneur lorsque c'est terminé (`--rm`)

## Dump de la base de données

Pour le dump et la sauvegarde de la base de données (ici avec MySQL) conteneurisée :

```sh
MYSQL_PWD=mot-de-passe docker exec -e MYSQL_PWD nom-du-conteneur mysqldump -u utilisateur nom-de-la-db > dump.sql
```

Le `MYSQL_PWD=mot-de-passe` met le mot de passe dans une variable d'environnement du shell courant et la passe au conteneur, ceci afin de ne pas se retrouver avec le mot de passe dans l'historique du shell.

## Script de backup complet volume + dump

Ci-dessous le script de sauvegarde final que j'utilise avec un cron qui l'exécute toutes les nuits. Le script :

- Sauvegarde le volume
- Fait le dump MySQL
- Fait le ménage pour ne garder que les backups des 7 derniers jours
- Envoi un rapport par email

```sh
#!/bin/bash

#======================================================================
# backup-docker.sh - Docker volumes and database backup script
#======================================================================
# by fabien a. [f@feub.net]
# https://fabienamann.dev/
#======================================================================
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.&nbsp; See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not,
#  - write to the Free Software
#               Foundation, Inc.,
#               51 Franklin Street,
#               Fifth Floor,
#               Boston, MA  02110-1301
#               USA.
#               - See http://www.gnu.org/licenses/gpl.html
#======================================================================

# Variables
BACKUP_DIR="/home/utilisateur/backups"
VOLUME_NAME="images_data"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${VOLUME_NAME}-${TIMESTAMP}.tar.gz"
MYSQL_USER="utilisateur-mysql"
MYSQL_PWD="mot-de-passe-mysql"
MYSQL_DB="nom-de-la-database"
MYSQL_CONTAINER="conteneur-mysql"
MYSQL_DUMP_FILE="${BACKUP_DIR}/${MYSQL_DB}-${TIMESTAMP}.sql"
EMAIL_TO="usr@email.net"
EMAIL_FROM="usr@email.net"
EMAIL_SUBJECT="Backup of ${VOLUME_NAME} and ${MYSQL_DB} on $(hostname) - $(date +%d-%m-%Y\ %H:%M:%S)"
# /Variables

# Initialize status tracking
VOLUME_BACKUP_STATUS="FAILED"
MYSQL_BACKUP_STATUS="FAILED"
VOLUME_SIZE=""
MYSQL_SIZE=""

echo "BACKUP STARTING - $(date +%d-%m-%Y\ %H:%M:%S)"
echo "- Backing up in: ${BACKUP_DIR}"
echo "- Starting backing up volume: ${VOLUME_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
if docker run --rm \
    -v "$VOLUME_NAME":/data \
    -v "$BACKUP_DIR":/backup \
    --user "$(id -u):$(id -g)" \
    alpine \
    tar czf "/backup/$(basename "$BACKUP_FILE")" -C /data .; then

    VOLUME_BACKUP_STATUS="SUCCESS"
    VOLUME_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "- Volume backed up created: ${BACKUP_FILE} (${VOLUME_SIZE})"
else
    echo "- ERROR: Volume backup failed!"
fi

echo "- Starting MySQL dump of database: ${MYSQL_DB}"

# Create dump of MySQL database
if MYSQL_PWD=${MYSQL_PWD} docker exec -e MYSQL_PWD ${MYSQL_CONTAINER} mysqldump -u ${MYSQL_USER} ${MYSQL_DB} >${MYSQL_DUMP_FILE}; then

    MYSQL_BACKUP_STATUS="SUCCESS"
    MYSQL_SIZE=$(du -h "$MYSQL_DUMP_FILE" | cut -f1)
    echo "- MySQL dump created: ${MYSQL_DUMP_FILE} (${MYSQL_SIZE})"
else
    echo "- ERROR: MySQL dump failed!"
fi

echo "- Cleanup (keeping only files older than 7 days)"

# Keep only files older than 7 days
find "$BACKUP_DIR" -name "${VOLUME_NAME}-*.tar.gz" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "${MYSQL_DB}-*.sql" -type f -mtime +7 -delete

# Create detailed email body
EMAIL_BODY=$(
    cat <<EOF
Backup Report for $(hostname)
========================================

Backup Date: $(date +%d-%m-%Y\ %H:%M:%S)
Backup Directory: ${BACKUP_DIR}

Volume Backup:
- Volume Name: ${VOLUME_NAME}
- Status: ${VOLUME_BACKUP_STATUS}
- File: ${BACKUP_FILE}
- Size: ${VOLUME_SIZE}

MySQL Database Backup:
- Database: ${MYSQL_DB}
- Status: ${MYSQL_BACKUP_STATUS}
- File: ${MYSQL_DUMP_FILE}
- Size: ${MYSQL_SIZE}

Disk Usage:
$(df -h ${BACKUP_DIR})

Recent Backup Files:
$(ls -lah ${BACKUP_DIR}/*${TIMESTAMP}* 2>/dev/null || echo "No backup files found for this timestamp")

Overall Status: $([[ "$VOLUME_BACKUP_STATUS" == "SUCCESS" && "$MYSQL_BACKUP_STATUS" == "SUCCESS" ]] && echo "SUCCESS" || echo "PARTIAL FAILURE")
EOF
)

# Send email
echo "${EMAIL_BODY}" | /usr/bin/s-nail -s "${EMAIL_SUBJECT}" -r "${EMAIL_FROM}" ${EMAIL_TO}

# Check if email was sent successfully
if [ $? -eq 0 ]; then
    echo "- Email notification sent successfully"
else
    echo "- WARNING: Failed to send email notification"
fi

echo "BACKUP FINISHED - $(date +%d-%m-%Y\ %H:%M:%S)"

# Exit with appropriate code
if [[ "$VOLUME_BACKUP_STATUS" == "SUCCESS" && "$MYSQL_BACKUP_STATUS" == "SUCCESS" ]]; then
    exit 0
else
    exit 1
fi
```

Ne pas oublier de donner les droits d'exécution au fichier : `chmod +x backup-docker.sh`.

Exemple d'exécution du script :

```sh
$ ./backup-docker.sh
BACKUP STARTING - 24-06-2025 14:48:06
- Backing up in: /home/utilisateur/backups
- Starting backing up volume: images_data
- Volume backed up created: /home/utilisateur/backups/images_data-20250624-144806.tar.gz (77M)
- Starting MySQL dump of database: superdb
- MySQL dump created: /home/utilisateur/backups/superdb-20250624-144806.sql (88K)
- Cleanup (keeping only files older than 7 days)
- Email notification sent successfully
BACKUP FINISHED - 24-06-2025 14:48:11
```

L'email reçu ressemble à ça :

```
Backup Report for vps-xxxxxx.hvo.net
========================================

Backup Date: 24-06-2025 14:48:11
Backup Directory: /home/utilisateur/backups

Volume Backup:
- Volume Name: images_data
- Status: SUCCESS
- File: /home/utilisateur/backups/images_data-20250624-144806.tar.gz
- Size: 77M

MySQL Database Backup:
- Database: superdb
- Status: SUCCESS
- File: /home/utilisateur/backups/superdb-20250624-144806.sql
- Size: 88K

Disk Usage:
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda4        39G   14G   26G  35% /

Recent Backup Files:
-rw-r--r--. 1 utilisateur utilisateur 87K Jun 24 14:48 /home/utilisateur/backups/superdb-20250624-144806.sql
-rw-r--r--. 1 utilisateur utilisateur 77M Jun 24 14:48 /home/utilisateur/backups/images_data-20250624-144806.tar.gz

Overall Status: SUCCESS
```

### Cron

Pour automatiser les sauvegardes, il suffit d'éditer le crontab de l'utilisateur : `crontab -e` :

```sh
# Tous les jours à 2h00
0 2 * * * /home/utilisateur/bin/backup-docker.sh
```
