---
slug: script-sauvegarde-websites
title: "Script Bash de sauvegarde de sites web"
authors: fabien
tags: [database, bash, linux]
---

Dans la lignée de mon dernier post à propos de [sauvegardes de volumes et de base de données Docker](/blog/sauvegardes-docker-volumes-mysql), je publie le script que j'utilise pour sauvegarder des sites web sur un serveur. J'utilise ce script depuis... 15 ans ? Je viens de le mettre à jour en y ajoutant les informations de statuts de sauvegarde.

<!-- truncate -->

## Fichier des sites

Ce script va lire un simple fichier texte qui contient 1 ligne par site. Une ligne de ce fichier possède 3 valeurs séparées par un espace, de la forme :

```
nom base_de_donnees chemin/vers/racine/du/site
```

Si un site n'a pas de base de données, on indique `nodb`. Voici un exemple de fichier, appelé `backup_websites_websites_vars.txt` dans le script ci-dessous :

```
monsite.net monsite_db var/www/monsite.net/www/
unautresite.org db_autre var/www/unautresite.org/
static.net nodb var/www/static.net/
```

Pour info, j'ai un fichier de 25 lignes, je sauvegarde donc 25 sites sur ce serveur.

## Le script

Ci-dessous le script de sauvegarde que j'utilise avec un cron qui l'exécute toutes les nuits. Le script :

- Fait le dump MySQL (+ compression)
- Sauvegarde les fichiers (+ compression)
- Fait le ménage
- Envoi un rapport détaillé par email

```sh
#!/bin/bash

#======================================================================
# backup_websites.sh - Websites Backup script
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
# VARIABLES
#======================================================================

BKP_NAME=backup_websites
CIBLE_TAR=home/utilisateur/backup/${BKP_NAME}
CIBLE=/${CIBLE_TAR}

REF_DATE=$(date +"%Y%m%d-%H%M%S")

# DB info
MYSQL_USER=utilisateur_db
MYSQL_PW=password_db

# IMPORTANT:
# This file defines what has to be backed up
# Each line has 3 parameters separated by a space and represents a website:
# name database_name path/to/website/root/to/backup
# For example:
# monsite.net monsite_db /var/www/monsite.net/html/
# Be sure not to have any empty lines (even the last one)
SITES_FILE=/home/utilisateur/bin/backup_websites_websites_vars.txt

# Files and/or directories to exclude
# Ex. EXCLUDE_LIST="--exclude=var/www/storage/cache/ --exclude=var/www/tmp/ --exclude=var/www/badfile.tgz"
EXCLUDE_LIST=""

MAIL_DEST="utilisateur@monsite.net"

FINALUSER=utilisateur

# Status tracking
OVERALL_BACKUP_STATUS="SUCCESS"
BACKUP_RESULTS=()
TOTAL_WEBSITES=0
SUCCESSFUL_WEBSITES=0
FAILED_WEBSITES=0

#======================================================================
# EXECUTION
#======================================================================

# Make sure only root can run our script
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root"
    exit 1
fi

logger Start ${BKP_NAME}.sh at $(date +"%D - %T")

# The script deletes all previous backups before starting a new one.
# Be sure to get them locally or somewhere else before
# or comment this line out to keep them all if you've the space
rm -f ${CIBLE}/*

echo "BACKUP STARTING - $(date +%d-%m-%Y\ %H:%M:%S)"

if [ ! -d ${CIBLE} ]; then
    echo "\"${CIBLE}\" directory doesn't exist, creating it now."
    mkdir -p ${CIBLE}/log || exit 1
fi

while read LINE; do
    NAME=$(echo $LINE | awk '{print $1}')
    DB_NAME=$(echo $LINE | awk '{print $2}')
    SITE_ROOT_TAR=$(echo $LINE | awk '{print $3}')
    SITE_ROOT=/${SITE_ROOT_TAR}

    TOTAL_WEBSITES=$((TOTAL_WEBSITES + 1))

    # Initialize status for this website
    WEBSITE_STATUS="SUCCESS"
    DB_STATUS="N/A"
    COMPRESSION_STATUS="FAILED"
    DB_SIZE=""
    ARCHIVE_SIZE=""

    echo "Backup $NAME"
    echo "-----------------------------------------------------------"

    # If there is a database to backup for that site
    if [ $DB_NAME != "nodb" ]; then
        # Clean old dump
        rm -f ${SITE_ROOT}/dump-${DB_NAME}-*

        FILEOUT=dump-${DB_NAME}-${REF_DATE}.sql
        echo " - Dump SQL file $FILEOUT :"

        # Let's dump
        if mysqldump -u $MYSQL_USER -p$MYSQL_PW $DB_NAME >$FILEOUT 2>/dev/null; then
            echo " - Compressing file"
            GZ=$FILEOUT.tar.gz

            if tar -zvcf $GZ $FILEOUT >/dev/null 2>&1; then
                echo " - Remove uncompressed file"
                rm -f $FILEOUT
                FILEOUT=$GZ
                DB_SIZE=$(du -sh ${FILEOUT} | awk '{print $1}')
                echo " - Size : ${DB_SIZE}"
                DB_STATUS="SUCCESS"
            else
                echo " /!\ tar failed. Will NOT remove uncompressed SQL file"
                DB_STATUS="FAILED"
                WEBSITE_STATUS="FAILED"
            fi
        else
            echo " /!\ MySQL dump failed. Check that server is up and check the username + password"
            DB_STATUS="FAILED"
            WEBSITE_STATUS="FAILED"
        fi

        if [ "$DB_STATUS" == "SUCCESS" ]; then
            echo " - Move the file to ${SITE_ROOT}"
            mv $FILEOUT ${SITE_ROOT}
        fi

        echo "--%<------------------------------------------------------------------"
    fi

    #======================================================================
    # COMPRESSION
    #======================================================================
    BASENAME_STAMP=${REF_DATE}-${NAME}

    echo " - Compression tgz"

    if tar -czvf ${CIBLE}/${BASENAME_STAMP}.tgz -C / ${SITE_ROOT_TAR} ${EXCLUDE_LIST} >/dev/null 2>&1; then
        ARCHIVE_SIZE=$(du -sh $CIBLE/${BASENAME_STAMP}.tgz | awk '{print $1}')
        echo " - Archive created successfully: ${ARCHIVE_SIZE}"
        COMPRESSION_STATUS="SUCCESS"
    else
        echo " /!\ Archive creation failed"
        COMPRESSION_STATUS="FAILED"
        WEBSITE_STATUS="FAILED"
    fi

    echo "-----------------------------------------------------------"
    echo " - Total size : ${ARCHIVE_SIZE}"
    echo "-----------------------------------------------------------"

    # Store results for this website
    BACKUP_RESULTS+=("$NAME|$DB_NAME|$DB_STATUS|$COMPRESSION_STATUS|$DB_SIZE|$ARCHIVE_SIZE|$WEBSITE_STATUS")

    if [ "$WEBSITE_STATUS" == "SUCCESS" ]; then
        SUCCESSFUL_WEBSITES=$((SUCCESSFUL_WEBSITES + 1))
    else
        FAILED_WEBSITES=$((FAILED_WEBSITES + 1))
        OVERALL_BACKUP_STATUS="FAILED"
    fi

done <$SITES_FILE

echo "End of the backup : $(date +%D), $(date +%T) "
echo "======================================================================"

# Change permissions
/bin/chmod -R +r ${CIBLE}
/bin/chown -R ${FINALUSER} ${CIBLE}

#======================================================================
# EMAIL CONSTRUCTION AND SENDING
#======================================================================

EMAIL_SUBJECT="[${OVERALL_BACKUP_STATUS}] Backup Websites $(hostname) - $(date +%d-%m-%Y\ %H:%M:%S) (${SUCCESSFUL_WEBSITES}/${TOTAL_WEBSITES} successful)"

EMAIL_BODY=$(
    cat <<EOF
Website Backup Report for $(hostname)
========================================

Backup Date: $(date +%d-%m-%Y\ %H:%M:%S)
Backup Directory: ${CIBLE}

Summary:
- Total Websites: ${TOTAL_WEBSITES}
- Successful: ${SUCCESSFUL_WEBSITES}
- Failed: ${FAILED_WEBSITES}
- Overall Status: ${OVERALL_BACKUP_STATUS}

Detailed Results:
========================================
EOF
)

# Adding detailed results for each website
for result in "${BACKUP_RESULTS[@]}"; do
    IFS='|' read -r name db_name db_status compression_status db_size archive_size website_status <<<"$result"

    EMAIL_BODY+="\n\nWebsite: $name"
    EMAIL_BODY+="\n- Status: $website_status"
    EMAIL_BODY+="\n- Database: $db_name"
    EMAIL_BODY+="\n- DB Backup: $db_status"
    if [ "$db_size" != "" ]; then
        EMAIL_BODY+="\n- DB Size: $db_size"
    fi
    EMAIL_BODY+="\n- Archive: $compression_status"
    if [ "$archive_size" != "" ]; then
        EMAIL_BODY+="\n- Archive Size: $archive_size"
    fi
    EMAIL_BODY+="\n$([[ "$website_status" == "SUCCESS" ]] && echo "✓" || echo "✗") $name backup completed"
done

EMAIL_BODY+="\n\nDisk Usage:"
EMAIL_BODY+="\n$(df -h ${CIBLE})"

echo -e "${EMAIL_BODY}" | /bin/mail -s "${EMAIL_SUBJECT}" ${MAIL_DEST}

if [ $? -eq 0 ]; then
    echo "- Email notification sent successfully"
else
    echo "- WARNING: Failed to send email notification"
fi

logger End ${BKP_NAME}.sh at $(date +"%D - %T")

# Exit with appropriate code
if [[ "$OVERALL_BACKUP_STATUS" == "SUCCESS" ]]; then
    exit 0
else
    exit 1
fi
```

Ne pas oublier de donner les droits d'exécution au fichier : `chmod +x backup_websites_.sh`.

### Cron

Pour automatiser les sauvegardes, il suffit d'éditer le crontab de l'utilisateur : `crontab -e` :

```sh
# Tous les jours à 2h00
0 2 * * * /home/utilisateur/bin/backup_websites.sh
```
