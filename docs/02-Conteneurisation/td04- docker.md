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
La version 24.04 est-elle disponible ?

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
1. **Notez l'identifiant** de cette image.
1. Effacez l'image via la commande `docker rmi <identifiant de l'image>`.
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
1. Comparez le résultat de la commande précédente avec le résultat de la commande `docker ps`.
Que constatez-vous ?
1. Vérifiez dans les logs du conteneur, via la commande `docker logs devops-hello`, 
que l'instruction a bien été exécutée.
1. Démarrez à nouveau le conteneur via `docker start devops-hello`.
1. Consultez à nouveau les logs et vérifiez la seconde exécution de l'instruction.
1. Consultez le **statut** du conteneur via `docker ps -a`. Le conteneur est-il en cours d’exécution ?

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
1. Entrez **DANS** le conteneur via la commande `docker exec -it devops-sleep /bin/bash`.
    1. Listez les fichiers/dossiers présents dans le conteneur `ls -lrtd *`.
	1. Vérifiez la présence des fichiers `/bin/bash`, `/bin/echo` et `/bin/sleep`.
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

Commencez par noter l'identifiant du conteneur que vous avez utilisé.
Cette identifiant est affiché via la commande `docker ps -a`.
Ensuite exécutez la commande : 

```
docker commit -a 'g12345' -m "Installation de git dans l'image" <identifiant_conteneur> ajout_de_git
```

Consultez la nouvelle image créée via `docker image ls` et 
prenez attention au **nom** de cette image et comparez la **taille** 
de cette image avec celle de l'image ubuntu d'origine.

Vous pouvez consultez le détail de cette nouvelle image via la commande `docker history ajout_de_git`.

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
accessibles pendant la construction de l'image et au moment
de l'exécution du conteneur.
- `EXPOSE` : indique au Dockerfile quels ports le conteneur 
utilisera pour communiquer avec l'extérieur.
- `WORKDIR` : définit le répertoire courant dans lequel 
les instructions suivantes du Dockerfile 
ou les commandes exécutées dans le conteneur, s'exécuteront.


:::note Exercice 1 : Conteneuriser un jar

Modifiez le Dockerfile ci-dessous pour conteneuriser votre application
`demo-no-db`. Ce premier Dockerfile doit copier le fichier `demo-1.0.0.jar` dans 
le conteneur. La commande pour construire une image à
partir d'un fichier intitulé *Dockerfile* présent dans le repertoire courant est 
`docker build -f Dockerfile -t g12345/spring-demo-no-db .`

Comparez la taille de l'image `g12345/spring-demo-no-db` avec l'image ubuntu d'origine.

Vérifiez vos modifications en démarrant un conteneur basé sur 
l'image `g12345/spring-demo-no-db` et consommez le service grâce à l'url 
`localhost:8080/config`. Déterminez l'utilité des options `-d` et `-p` dans les commandes : 
- `docker run g12345/spring-demo-no-db -d`
- `docker run g12345/spring-demo-no-db -p 9000:8080`

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

# Expose le port utilisé par l'application
EXPOSE 8080

# Commande pour exécuter l'application
CMD ["java", "-jar", "/app/your-application.jar"]

```

:::

:::warning Taille et instruction RUN

Chaque instruction `RUN` ajoute une **couche** à l'image Docker. 
En combinant les commandes dans une seule instruction ``RUN``, 
vous limitez le nombre de couches inutiles.

:::


:::note Exercice 2 : Utiliser une source image adaptée

1. Modifiez le Dockerfile en vous basant sur l'image `eclipse-temurin` (`FROM`). 
1. Vérifiez sur Docker Hub si cette image contient une version de Java.
1. Supprimez les instructions devenues inutiles. 

:::

Lorsqu'on automatise le déploiement d'une application, on doit
souvent effectuer l'empaquetage (la création du jar dans notre cas) au sein du conteneur.
Essayez de vous entraîner à cette pratique avec l'exercice
suivant.

:::note Exercice 3 : Empaqueter dans le conteneur

Recherchez sur Docker Hub l'image officielle de maven.
Modifiez le Dockerfile précédent pour se baser sur cette image
de maven. Ce Dockerfile doit copier les
sources et le pom.xml de votre application dans le conteneur
et empaqueter l'application
au sein du conteneur grâce à maven.

Vérifiez vos modifications en consommant le service fourni
par le conteneur construit par cette image.

:::

Utiliser une image multi-stage, où la compilation est faite dans une première étape 
et seule l’application compilée est copiée dans l’image finale permet d'optimiser 
les ressources. Pour réaliser un tel Dockerfile vous devez : 

- définir une première image pour la compilation
- créer une seconde image pour l'exécution

Essayez-vous à cette pratique avec l'exercice ci-dessous.

:::note Exercice 4 : Optimiser une image avec une build multi-stage

Améliorez le Dockerfile précédent pour utiliser une 
multi stage build.

Comparez les tailles des différentes images produites dans
ces exercices afin de déterminer la pratique la plus efficace
en ressources.

:::


## Créer un Dockerfile complet

![work in progress](/img/work-in-progress.jpeg)