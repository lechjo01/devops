import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 04 - Docker

Docker est une plateforme open-source qui permet de créer, 
déployer et exécuter des applications dans des conteneurs isolés.
Ce TD vous apprendra à manipuler les bases de la gestion des conteneurs.

### Objectifs 

À l’issue de ce TD, vous serez capable de :

1. Installer Docker sur le système d'exploitation de votre machine.
1. Apprendre à utiliser les commandes de gestion des images et des conteneurs Docker.
1. Créer une image Docker à partir d'un fichier Dockerfile.

:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum) et un IDE (VS Codium).

:::

## Installer Docker

L'installation de Docker, expliquée ci-dessous, dépend de votre 
système d'exploitation.
Une fois installé, n'oubliez pas de vérifier que Docker fonctionne 
via la commande `docker --version`.

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux">
	[Installez Docker Engine et Docker CLI en suivant la documentation officielle](https://docs.docker.com/engine/install/). 
	Les étapes incluent l’ajout des dépôts Docker, l’installation 
	des paquets nécessaires, et la **configuration des permissions 
	pour exécuter Docker sans privilèges root**.

	:::info Docker Engine

	C'est le moteur principal de Docker. Il permet de créer, 
	exécuter et gérer des conteneurs. Avec Docker Engine :

	- Vous utilisez le daemon Docker (`dockerd`) pour gérer les conteneurs.
	- Vous contrôlez Docker via la ligne de commande (**CLI**).

	:::
  </TabItem>
  <TabItem value="win" label="Windows/macOS">

	[Téléchargez et installez Docker Desktop](https://docs.docker.com/desktop/). 
	Il inclut : Docker Engine, Docker CLI, Docker Compose, et une interface graphique.

	- Windows : Assurez-vous que **WSL 2** (Windows Subsystem for Linux) 
	est activé, car Docker Desktop utilise WSL pour exécuter ses conteneurs.
	- macOS : Docker Desktop fonctionne directement et ne nécessite 
	pas de configuration supplémentaire.

	:::info Docker Desktop

	C'est une application complète pour Windows et macOS. 
	Elle inclut Docker Engine, la CLI et d'autres outils comme Docker Compose.
	Avec Docker Desktop vous obtenez une interface graphique pour gérer vos conteneurs.

	:::
  </TabItem>
</Tabs>

## Registre de conteneurs - Container registry

Les conteneurs utilisés par Docker peuvent être créés localement
ou téléchargés d'une plateforme en ligne appelée **registre de conteneurs**.
Le registre utilisé par défaut  par Docker pour télécharger (**pull**) 
ou publier (**push**) ces images est [**Docker Hub**](https://hub.docker.com). 
Vous y trouverez des images officielles maintenues par Docker et sa communauté.

:::note Image Docker

Une image Docker est un **modèle** qui contient 
tout ce dont une application a besoin pour s’exécuter : 
le code, les bibliothèques, les dépendances, les configurations 
et le système d’exploitation minimal requis. 
Elle sert de point de départ pour créer des conteneurs.

:::

Consultez le site de [Docker Hub](https://hub.docker.com) 
et cherchez quelles sont les versions de l'image ubuntu disponibles au téléchargement.

Le début de l'apprentissage de Docker consiste en la maîtrise des 
commandes de base pour gérer des images. 
Parcourez ce tutoriel et prenez note des différentes commandes.

:::info tutoriel image Docker

1. Vérifiez qu'aucune image n'est présente sur votre machine via 
la commande `docker image ls`.
1. Téléchargez l'image de la version 24.04 d'ubuntu trouvée sur 
le registre avec la commande `docker pull ubuntu:24.04`.
1. Vérifiez la présence de l'image sur votre machine avec la 
commande `docker image ls`.
1. **Notez la taille** de cette image en MB.
1. Effacez l'image via la commande `docker rmi ubuntu:24.04`.
1. Listez à nouveau les images pour vérifier le succès de la suppression.
1. Cherchez, téléchargez et **comparez la taille** de l'image 
de la dernière version de Alpine Linux (`alpine:latest`).

:::

## Conteneur Docker - Docker Container

:::note Conteneur Docker

Un conteneur est une instance en cours d’exécution d’une image Docker. 
C’est une unité isolée qui regroupe une application et tout 
son environnement d’exécution, y compris les dépendances, les bibliothèques 
et les configurations nécessaires. 

:::

### Un premier conteneur : Hello World

Comme pour les images, la première étape pour comprendre les conteneurs 
est d'introduire les commandes associées.
Suivez ce tutoriel et prenez notes des différentes commandes.

:::info tutoriel Conteneur Docker

1. Exécutez la commande `docker run --name devops-hello ubuntu:24.04  /bin/echo 'Hello World!'`.
1. Vérifiez que la commande a bien affiché `Hello World` dans le terminal.
1. Consultez la liste des conteneurs via `docker ps -a`.
1. Vérifiez dans les logs du conteneur, via la commande `docker logs devops-hello`, 
que l'instruction a bien été exécutée.
1. Démarrez à nouveau le conteneur via `docker start devops-hello`.
1. Consultez à nouveau les logs et vérifiez la seconde exécution de l'instruction.
1. Consultez le **statut** du conteneur via `docker ps -a`.

:::

Si vous décomposez la commande qui a permis d'afficher `Hello World`, 
vous pouvez y lire trois parties  :
- exécution par Docker du conteneur de la version 24.04 de 
ubuntu `docker run ubuntu:24.04`
- exécution **à l'intérieur du conteneur** de la commande 
`/bin/echo 'Hello World!'`
- association du nom `devops-hello` avec le conteneur via
`--name devops-hello`

Remarquez que l'ordre des paramètres est important. 
`docker run  ubuntu:24.04  /bin/echo --name devops-hello 'Hello World!'` 
conduira à une erreur.

:::warning conteneur anonyme

Vous pouvez exécutez un conteneur anonyme 
`docker run ubuntu:24.04  /bin/echo 'Hello World!'`. 
Il faudra simplement récupérer son nom via `docker ps -a`.

:::

L'exécution de la commande `docker run` précédente affiche 
dans le terminal le message suivant : 

```
Unable to find image 'ubuntu:24.04' locally
24.04: Pulling from library/ubuntu
de44b265507a: Pull complete 
Digest: sha256:80dd3c3b9c6cecb9f1667e9290b3bc61b78c2678c02cbdae5f0fea92cc6734ab
Status: Downloaded newer image for ubuntu:24.04
Hello world!
```

Ce message retrace les étapes réalisées par Docker pour exécuter le conteneur : 
1. Docker vérifie si l'image demandée est disponible localement comme si vous exécutiez `docker image ls`.
1. S'il ne la trouve pas, il télécharge l'image depuis Docker Hub.
1. Les couches de l'image sont téléchargées individuellement (un `Pull` par couche) .
1. Une fois l'image prête, Docker exécute la commande `/bin/echo 'Hello World!'` dans un conteneur basé sur cette image.
1. Le résultat de la commande est affiché (`Hello World!`) avant que **le conteneur ne se termine**.

### A l'intérieur d'un conteneur

Ce premier conteneur est un peu décevant car il s'arrête aussi tôt créé. 
Suivez le prochain tutoriel qui utilise un conteneur qui reste 
allumé 5 minutes afin que nous puissions le manipuler un peu plus.

:::info tutoriel Conteneur Docker Actif

1. Exécutez la commande `docker run --name devops-sleep ubuntu:24.04 /bin/sleep 3600`.
1. **Ouvrez un second terminal** et consultez le statut du conteneur via la commande `docker ps -a`.
1. Entrez **DANS** le conteneur via la commande `docker exec -it devops-sleep /bin/bash`..
    1. Listez les fichiers/dossiers présents dans le conteneur `ls -lrtd *`.
	1. Vérifiez la présence des fichiers `/bin/echo` et `/bin/sleep`.
    1. Déplacez-vous dans le dossier `/home/ubuntu` via la commande `cd`.
    1. Essayez de cloner le dépôt `git clone https://git.esi-bru.be/4dop1dr-ressources/demo-no-db.git`.
    1. `git` n'est pas installé dans ce conteneur ubuntu, installez le via `apt -y update` et `apt -y install git`.
    1. Essayez à nouveau de cloner le dépôt `git clone https://git.esi-bru.be/4dop1dr-ressources/demo-no-db.git`.
    1. Sortez du conteneur via `exit`.
1. Arrêtez le conteneur via `docker stop devops-sleep`.
1. Vérifiez le statut du conteneur via `docker ps -a`.

:::

La commande pour "entrer dans le conteneur" 
`docker exec -it devops-sleep /bin/bash` 
peut se décomposer comme suit : 
- `docker exec` est une commande utilisée pour exécuter 
un processus dans un conteneur en cours d'exécution.
- `-i` (interactive) : Maintient l'entrée standard (stdin) 
ouverte pour que vous puissiez interagir avec le conteneur.
- `-t` (tty) : Alloue un pseudo-terminal pour permettre une 
expérience interactive (comme un terminal).
- `devops-sleep`est le nom du conteneur dans lequel la commande sera exécutée. 
- `/bin/bash` est la commande qui sera exécutée à l'intérieur du conteneur. 
Il s'agit de l'interpréteur de commandes, pour interagir avec le conteneur via un shell.

### Mise à jour d'une image

Le conteneur `devops-sleep` n'est plus le même que suite à sa création basée 
sur l'image d'origine. 
Vous pouvez décider d'enregistrer ces changements dans une nouvelle image
afin de disposer d'une image ubuntu avec git déjà installé. 

Commencez par noter l'identifiant de l'image que vous avez utilisé.
Cette identifiant est affiché via la commande `docker image ls`.
Ensuite exécutez la commande : 

```
docker commit -a 'g12345' -m "Installation de git dans l'image" <identifiant_image> ajout_de_git
```

Consultez cette nouvelle image via `docker image ls` et 
prenez attention au **nom** de cette image et comparez la **taille** 
de cette image avec celle de l'image ubuntu d'origine.

## Créer une image via un Dockerfile

Un Dockerfile est un fichier texte qui contient une série d'instructions permettant 
de construire une image Docker. Ce fichier décrit comment configurer l'environnement 
et les dépendances nécessaires pour exécuter une application dans un conteneur.

[La liste des instructions (directives)](https://docs.docker.com/reference/dockerfile/) 
est disponible via la documentation mais voici celles que nous allons utiliser

- `FROM` : Spécifie l'image de base.
- `RUN` : Exécute des commandes pendant la création de l'image.
- `COPY` : Ajoute des fichiers locaux dans l'image.
- `CMD` : Définit la commande exécutée lorsque le conteneur démarre.
- `LABEL` : ajoute des métadonnées à l'image.
- `ENV` : définit des variables d'environnement 
accessibles pendant la construction de l'image et au moment .
de l'exécution du conteneur.
- `EXPOSE` : indique au Dockerfile quels ports le conteneur 
utilisera pour communiquer avec l'extérieur.
- `WORKDIR` : définit le répertoire courant dans lequel 
les instructions suivantes du Dockerfile 
ou les commandes exécutées dans le conteneur, s'exécuteront.

Créez le fichier intitulé `Dockerfile` suivant : 

```bash title="Dockerfile" showLineNumbers
# Image de base Ubuntu 24.04
FROM ubuntu:24.04
# Nom de l'auteur
LABEL author="g12345"

# Mise à jour des paquets et installation de Java 17
RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean

# Définition des variables d'environnements pour Java
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Création d'un répertoire de travail pour l'application
WORKDIR /app

# Copie du fichier JAR de la machine locale vers le conteneur
COPY your-application.jar /app/your-application.jar

# Expose le port utilisé par l'application (par exemple, 8080)
EXPOSE 8080

# Commande pour exécuter l'application
CMD ["java", "-jar", "/app/your-application.jar"]

```

Construisez l'image basée sur ce Dockerfile.
Dans le dossier de votre Dockerfile, utilisez la commande 

```
docker build -t 'g12345/spring-demo-no-db' .
```

Comparez la taille de l'image avec l'image ubuntu d'origine.

:::warning Taille et instruction RUN

Chaque instruction `RUN` ajoute une **couche** à l'image Docker. 
En combinant les commandes dans une seule instruction ``RUN``, 
vous limitez le nombre de couches inutiles et réduisez la taille de l'image.

:::

Exécutez un conteneur basé sur cette image et consommez le service web de l'application spring-boot.

```
docker run g12345/spring-demo-no-db
```

:::note Exercice

1. Modifiez le Dockerfile en vous basant sur l'image `eclipse-temurin` (`FROM`). 
1. Supprimez les instructions devenues inutiles. 
1. Testez différentes version de l'image `eclipse-temurin` 
et spécifiquement les version **alpine**. Notez la taille des différentes images.
1. Déterminez l'utilité des options `-d` et `-p` dans les commandes : 
	1. `docker run g12345/spring-demo-no-db -d`
	1. `docker run g12345/spring-demo-no-db -p 9000:8080`

Les informations concernant l'image `eclipse-temurin` sont disponibles sur Docker Hub.

:::