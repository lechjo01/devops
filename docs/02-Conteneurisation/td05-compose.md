# TD 05 - Docker-compose

![work in progress](/img/work-in-progress.jpeg)

Date de publication : 2 février 2025

<!--
Docker Compose est un outil utilisé pour définir et gérer 
des applications multi-conteneurs dans un fichier YAML. 
Il simplifie la gestion des conteneurs, réseaux et volumes en 
unifiant leur configuration. 
Ce TD est consacré à l'apprentissage de Docker Network et Docker Compose
pour créer des applications multi-conteneurs.

### Objectifs 

À l’issue de ce TD, vous serez capable de :

1. Utiliser un conteneur MySQL.
1. Lier un conteneur MySQL à une application Spring Boot via Docker Network.
1. Orchestrer le déploiement des conteneurs MySQL et 
Spring Boot de manière simplifiée avec Docker Compose.l
1. Déployer une image sur Docker Hub.

:::warning Pré-requis

1. Connaissance de base de Docker ses images et ses conteneurs.
1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum) et un IDE (VS Codium).

:::

## Créer un conteneur Docker MySQL

Lancez un conteneur MySQL en spécifiant un mot de passe 
pour l'utilisateur root :

```
docker run -d --name mysql-container -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=mydb -p 3306:3306 mysql:latest
```

- `-d` : Exécute le conteneur en arrière-plan.
- `--name` : Attribue un nom au conteneur.
- `-e MYSQL_ROOT_PASSWORD` : Définit le mot de passe pour l'utilisateur root.
- `-e MYSQL_DATABASE` : Crée une base de données nommée mydb.
- `-p 3306:3306` : Expose le port MySQL du conteneur sur l'hôte.

## Un conteneur Spring Boot utilisant un conteneur MySQL

Créez un réseau Docker pour permettre aux conteneurs de communiquer entre eux :

```
docker network create my-network
```

Connectez le conteneur MySQL au réseau :

```
docker network connect my-network mysql-container
```

Lancez l'application Spring Boot dans un conteneur et connectez-la au même réseau :

```
docker run -d --name springboot-app --network my-network -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql-container:3306/mydb -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=rootpassword -p 8080:8080 springboot-app-image
```

L'option `--network my-network` permet à l'application de se connecter au conteneur MySQL en utilisant son nom DNS (`mysql-container`).

## Tester la communication entre les conteneurs

Docker DNS permet aux conteneurs sur le même réseau de se résoudre par leur nom. Par exemple, dans le conteneur de l'application Web, l'application peut se connecter à MySQL avec l'adresse my_database.

Pour voir les réseaux disponibles :

```
docker network ls
```

Pour inspecter les détails du réseau my_network :

```
docker network inspect my_network
```

Cela montre les conteneurs connectés et leurs adresses IP sur ce réseau.


Résumé des avantages

- Isolation : Chaque réseau Docker est isolé des autres, ce qui renforce la sécurité.
- Facilité de configuration : Pas besoin de configurer manuellement des adresses IP ou des règles de pare-feu.
- DNS intégré : Les conteneurs peuvent se résoudre par leur nom, simplifiant la communication.

Cet exemple montre comment utiliser Docker Network pour connecter des conteneurs et gérer leurs communications de manière claire et sécurisée.

## Simplifier avec Docker Compose

Au lieu de créer chaque conteneur manuellement, utilisez un fichier docker-compose.yml pour définir les services.

```yaml title="docker-compose.yml"
version: '3.8'

services:
  mysql:
    image: mysql:latest
    container_name: mysql-container
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydb
    networks:
      - my-network
    ports:
      - "3306:3306"

  springboot-app-1:
    image: springboot-app-image
    container_name: springboot-app
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/mydb
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
    networks:
      - my-network
    ports:
      - "8080:8080"

  springboot-app-2:
    image: springboot-app-image
    container_name: springboot-app-2
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/mydb
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
    networks:
      - my-network
    ports:
      - "8081:8080"

networks:
  my-network:
    driver: bridge
```

Lancer l'application avec Docker Compose

```
docker-compose up -d
```
Cela va :

1. Créer un réseau my_network automatiquement.
1. Lancer les conteneurs my_web_app et my_database.
1. Associer ces conteneurs au réseau défini.
1. Gérer les dépendances, s'assurant que db démarre avant web
1. Déployer une image sur Docker Hub pour la rendre accessible publiquement.


Lister les services en cours d'exécution :

```
docker-compose ps
```

Arrêter et supprimer les conteneurs, réseaux et volumes :

```
docker-compose down
```

En résumé, docker network est un outil de bas niveau pour gérer les connexions réseau, tandis que Docker Compose est un orchestrateur qui gère à la fois les connexions réseau, les dépendances entre services, les volumes, et plus encore.

## Déployer une application sur le Docker Hub

Créez un compte sur Docker Hub en utilisant votre mail étudiant comme nom d'utilisateur.

Ensuite dans un terminal, connectez vous à votre compte via la commande `docker login`. Une fois vos identifiants entrés, il suffit d'entrer la commande `docker push g12345/demo-spring-boot` pour déposer l'image sur votre compte Docker Hub.

Consultez votre image via [https://hub.docker.com/r/g12345/demo-spring-boot/](https://hub.docker.com/r/g12345/demo-spring-boot/`).

Vous pouvez télécharger cette image sur n'importe quel environnement Docker via `docker pull g12345/demo-spring-boot`

-->