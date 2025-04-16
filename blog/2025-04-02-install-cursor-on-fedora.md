---
slug: install-cursor-on-fedora
title: Install Cursor IDE on Fedora
authors: fabien
tags: [fedora, linux, ide]
---

**Cursor** est un éditeur de code axé sur l'intelligence artificielle, disponible pour les plateformes Windows, Mac et également Linux. La promesse est d'aider les développeurs à créer des logiciels plus rapidement et plus efficacement. Bien qu'au départ j'étais sceptique, je commence à l'utiliser et à en voir les atouts.

J'ai personnellement testé Cursor sur Fedora 41. L'installation reste simple, mais demande un peu plus d'étapes que sous Windows ou Mac. Je partage ici les étapes que j'ai suivies pour rendre Cursor opérationnel sur Fedora.

<!-- truncate -->

## Installer Cursor

- Se rendre sur [cursor.com](cursor.com) et cliquer sur [Download for Linux](cursor.com). Il s'agit d'une application **.AppImage** qui est un format permettant de distribuer des applications sur Linux de manière universelle et portable.

- Rendre le fichier exécutable, soit en faisant un clic-droit > permissions en mode GUI, ou avec un chmod en ligne de commande :

```sh
chmod +x Cursor-0.48.7-x86_64.AppImage
```

Voilà, l'application peut-être lancée.

## Ajouter Cursor dans la liste des applications installées

- Déplacer le fichier `.AppImage` dans le répertoire `/opt` en le renommant :

```sh
sudo mv Cursor-0.48.7-x86_64.AppImage /opt/cursor.AppImage
```

- Créer un fichier **desktop entry** pour Cursor :

```sh
sudo vim ~/.local/share/applications/cursor.desktop
```

Avec le contenu suivant :

```sh
[Desktop Entry]
Name=Cursor
Exec=/opt/cursor.AppImage
Icon=/opt/cursor.png
Type=Application
Categories=Development;
```

En option, il faut récupérer un PNG pour l'icône.
