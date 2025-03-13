# TD 05 - Docker-compose

Vous avez maintenant acquis les bases de Docker et appris à écrire 
des Dockerfile pour créer et exécuter des conteneurs. 
Cette série d'exercices va vous permettre d'aller plus loin en explorant 
des concepts essentiels pour le déploiement et l'orchestration 
d'applications conteneurisées.

Vous commencerez par approfondir le comportement des conteneurs 
avec la différence entre `ENTRYPOINT` et `CMD`, puis vous verrez comment 
optimiser vos images Docker grâce au fichier `.dockerignore`. 

Une fois ces bases maîtrisées, vous aborderez *Docker Compose*, 
un outil permettant de gérer plusieurs conteneurs. 
Vous créerez des configurations *docker-compose.yml* pour orchestrer 
une application Spring avec une base de données MySQL puis avec un 
*load balancer Nginx*.

### Objectifs 

À l'issue de ce TD, vous serez capable de :

1. Comprendre les mécanismes avancés de Docker.
1. Optimiser les images et les conteneurs.
1. Orchestrer des applications avec Docker Compose.
1. Configurer un serveur web NGINX.


:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum),
 un IDE (VS Codium) et Docker.
1. Connaissance de base de Docker ses images et ses conteneurs.

:::

## Docker
 
Dans cette section, vous allez approfondir certaines notions essentielles 
qui n'ont pas encore été abordées concernant Docker.

### ENTRYPOINT ou CMD

#### Etape 1 : Valeurs héritées

Lorsque vous utilisez des Dockerfiles, vous constatez
que deux instrutions assez proches sont utilisées pour 
demander d'exécutez une action au démarage du conteneur :
`CMD` et `ENTRYPOINT`.

Afin d'y voir plus clair dans la distinction entre ces 
deux directives, créez un Dockerfile à partir d'une image alpine.


```Dockerfile title="Dockerfile"
FROM alpine:latest
```

Ensuite créez l'image associée à ce Dockerfile via la commande : 

```bash
docker build -t test-no-entrypoint-no-cmd .
```

:::tip

Si vous souhaitez appeler le fichier autrement
que Dockerfile, le flag `-f` est disponible : 

```bash
docker build -f <NOM_DOCKERFILE> -t test-no-entrypoint-no-cmd .
```

:::

Enfin démarrez un conteneur basé sur cette image via la commande : 

```bash
docker run test-no-entrypoint-no-cmd
```

Le conteneur démarre et aucune action ne semble avoir été exécutée. Inspectez la configuraion de l'image et **cherchez** la valeur des directives CMD et Entrypoint de ce conteneur
dans le résultat de la commande :

```bash
docker inspect test-no-entrypoint-no-cmd
```

Vous devez constater via cette inspection que la valeur de la directive **CMD** est `/bin/sh`.
Ce qui signifie que la commande `docker run` : 
- effectue la création du conteneur à partir de alpine.
- effectue l'execution de la commande `/bin/sh` dans alpine.
- arrête le conteneur dès que la commande `/bin/sh` s'arrête.

Avant de passer à la suite, effacez ce conteneur de test.

:::tip

Lorsque vous démarrez des conteneurs temporaires, vous pouvez les effacer automatiquement après leur exécution en utilisant le flag `-rm` comme ci-dessous.

```bash
docker run --rm test-no-entrypoint-no-cmd
```

:::

#### Etape 2 : CMD personalisé

Modifiez votre Dockerfile et créez une image écrasant la directive **CMD** : 


```Dockerfile title="Dockerfile"
FROM alpine:latest

CMD ["echo", "Hello, World!"]
```

Construisez l'image `test-no-entrypoint-cmd`et démarrez
un conteneur pour tester cette image.

La commande `docker run` : 
- effectue la création du conteneur à partir de alpine.
- effectue l'execution de la commande `/bin/echo "Hello, World!"` dans alpine.
- arrête le conteneur dès que la commande `/bin/echo` s'arrête.

Si vous essayez de démarrer le même conteneur en passant
un argument comme dans la commande suivante, une erreur apparait.

```bash
docker run --rm test-no-entrypoint-cmd "Bonjout tout le monde"
```

Il semble impossible de pouvoir passer un argument à `docker run` avec cette image.

#### Etape 3 : ENTRYPOINT et les paramètres

Effacez votre conteneur et modifiez votre Dockerfile pour
ajouter la direcive **ENTRYPOINT** ajoutant la possibilité de gérer des arguments.

```Dockerfile title="Dockerfile"
FROM alpine:latest  

ENTRYPOINT ["echo"]

CMD ["Hello, World!"]
```

Construisez l'image `test-entrypoint-cmd` et démarrez
un conteneur pour tester cette image.
Vous constatez que "Hello, World!" s'affiche dans
le terminal.

Si vous essayez à nouveau de passer un argument, vous constaterez que la valeur donnée à la directive **CMD**
a été écrasée.

:::info ENTRYPOINT ou CMD
**ENTRYPOINT** est utilisé pour définir un programme 
principal qui **s'exécutera toujours**, même si des 
arguments sont passés.
**CMD** définit des **arguments par défaut** pour ENTRYPOINT 
mais peut être remplacé si des arguments sont fournis à la 
commande `docker run`.
:::

Un tableau récapitulatif est disponible sur la [documentation des directives de docker](https://docs.docker.com/reference/dockerfile/#understand-how-cmd-and-entrypoint-interact).

### Optimiser la taille des images Docker

Vous avez vu comment `ENTRYPOINT` et `CMD` influencent le comportement 
d'un conteneur au démarrage. Cependant, lorsqu'on construit une image 
Docker, il est essentiel de ne pas inclure des fichiers inutiles pour 
optimiser la **taille** et la **sécurité**. C'est là qu'intervient `.dockerignore`, 
qui vous permet de contrôler ce que Docker copie dans l'image.  Ce fichier fonctionne comme un `.gitignore`.

Pour l'utiliser il suffit de créer au même niveau que le fichier `Dockerfile`, le fichier `.dockerignore`.
Ce fichier est à adapter suivant les projets. On peut
à titre d'exemple imaginer la version ci-dessous pour 
un projet développé en python : 

```bash title=".dockerignore"
# Ignorer les fichiers de configuration sensibles
# contenant des mots de passes ou des clés API
.env   

# Environnement virtuel 
venv/         

# Ignorer les fichiers temporaires et inutiles  

## Fichiers de logs (ex: `server.log`) 
*.log   
## Fichiers compilés en bytecode Python     
*.pyc  
## Fichier caché généré automatiquement par macOS      
.DS_Store    

# Ignorer les fichiers liés à Git  
## Dossier contenant l'historique Git
.git/ 
## Fichier de configuration Git         
.gitignore   

```

La commande `docker build` excluera les fichiers et dossiers mentionnés dans le ``.dockerignore``.

:::note Exercice 1 : Exclure application.properties

Dans une application Spring-boot le fichier `application.properties` peut
contenir des données sensibles tel que le mot de passe
de la base de données. Excluez ce fichier de l'image construite à
partir de l'application `demo-no-db` créée
dans le td précédent.

Comment allez-vous vérifier que ce fichier est bien 
absent des conteneurs générés à partir de cette image ? 

:::


:::tip Afin d'optimiser la taille des images Docker

- Utilisez une image de base légère (`FROM ... -alpine`).
- Utilisez un `.dockerignore`.
- Minimisez le nombre de couches (`RUN` en une seule commande).
- Utilisez le principe du **multi-stage builds**.
- Nettoyez les dépendances temporaires.
- Évitez d'installer des outils inutiles.

:::

:::note Exercice 2 : Gestion des privillèges

Modifiez le Dockerfile de l'application demo-no-db en créant un utilisateur sans les privilèges root comme conseillé à la fin du td précédent.

:::

## Docker compose

Gérer plusieurs conteneurs manuellement peut vite devenir complexe. 
Docker Compose simplifie cette gestion en permettant de définir et d'orchestrer 
plusieurs services dans un simple fichier YAML.

### Manipulation de YAML

Avant de pouvoir tirer pleinement parti de Docker Compose, il est essentiel de maîtriser
la syntaxe des fichiers YAML. 
Une bonne compréhension de YAML vous permettra de structurer correctement vos fichiers 
`docker-compose.yml` et d'éviter les erreurs courantes.

Le YAML est un format de données utilisé pour stocker et échanger des informations structurées. 
Les données sont représentées sous forme de paires
`clé: valeur`. Ce format utilise **uniquement** les **espaces** pour l'indentation.

```yaml title="config.yml"
# Configuration de l'application
application:
  name: "Gestionnaire de tâches"
  version: "1.0.0"
  debug: true

# Liste des utilisateurs
users:
  - name: "Alice"
    role: "admin"
    email: "alice@example.com"
  - name: "Bob"
    role: "user"
    email: "bob@example.com"

# Paramètres de la base de données
database:
  host: "localhost"
  port: 5432
  username: "admin"
  password: "secret"
```

:::note Exercice 3 : YAML et erreurs courantes

Trouvez les erreurs dans les fichiers YAML proposés ci-dessous.
Pour vous aider vous pouvez vérifier que le fichier respecte 
le format via [l'outil en ligne yamllint.com](https://www.yamllint.com/).

#### Exemple 1

```yaml
database:
    host: localhost
  port: 5432
```

#### Exemple 2

```yaml
users:
  - name: Alice
    role: admin
    email: alice@example.com
  - name: Bob
     role: user
```

#### Exemple 3

```yaml
description: This is a test: with a colon
```

#### Exemple 4

```yaml
message: This is a test # with a comment caracter
```
:::

### Docker network
Dans cette section vous allez créer les conteneurs permettant
d'utliser l'application Spring Boot demo avec une base
de données MySql.

:::note Exercice 4 : Dockerfile pour une application Spring avec bases de données

Commencez par **écrire le Dockerfile** permettant de
lancer l'application Spring Boot `demo` via la 
commande suivante

```bash
docker run --rm \
  --name spring-boot-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb \
  -e SPRING_DATASOURCE_USERNAME=sa \
  -e SPRING_DATASOURCE_PASSWORD= \
  -e SPRING_JPA_DEFER_DATASOURCE_INITIALIZATION=true \
  g12345/spring-demo
```

g12345 doit être adapté à votre matricule.

:::

Une fois l'exercice terminé, vous pouvez utiliser l'image avec 
la base de données embarquée H2 **mais en changeant la valeur des variables 
d'environnements** vous pourrez l'utiliser aussi avec 
une base de données MySql démarée à l'aide d'un conteneur.

Pour ce faire vous aller devoir suivre les étapes suivantes : 
1. créer un réseau de communication entre les conteneurs
MySql et Spring Boot.
1. créer un conteneur MySql associé à ce réseau.
1. créer un conteneur Spring Boot associé à ce réseau avec les
variables d'environnements correspondants à la base de données
MySql.

#### Créer un réseau de communication

Pour créer ce réseau il suffit d'utiliser la commande :

```bash
docker network create my-network-db
```

#### Créer un conteneur MySql associé à ce réseau

L'étape suivante consiste à démarrer un conteneur utilisant
l'image MySql, comme dans le td précédent, en le connectant à ce réseau grâce à l'option `--network` :

```bash
docker run -d \
  --name mysql-container \
  --network my-network-db \
  -e MYSQL_USER=g12345 \
  -e MYSQL_PASSWORD=secret \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=mydatabase \
  -p 3306:3306 \
  mysql:9.2.0
```

Vérifiez que la base de données MySql a terminé de démarrer avant
de passer à la suite en consultant les logs du conteneur.

#### Créer un conteneur Spring Boot associé à ce réseau

Finalement, dès que la base de données est opérationnelle,
vous devez démarrer le conteneur de l'application
Spring Boot avec ses variables d'environnement via la commande : 

```bash
docker run --rm \
  --name spring-demo-app \
  --network my-network-db \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql-container:3306/mydatabase \
  -e SPRING_DATASOURCE_USERNAME=g12345 \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  -e SPRING_JPA_DEFER_DATASOURCE_INITIALIZATION=true \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=create \
  -e SPRING_SQL_INIT_MODE=always \
  g12345/spring-demo
```

Consommez le service rest à l'adresse [localhost:8080/config](localhost:8080/config) pour vérifier que votre configuration
fonctionne. 

Si vous obtenez le résultat attendu, supprimez les conteneurs créés avant de passer à l'étape suivante.

:::tip Suppression d'un réseau

Vous pouvez consulter les réseaux utilisés par Docker
via la commande `docker network ls`. Pour supprimer un réseau
devenu inutile il vous suffit d'utiliser la commande
`docker network rm <nom du réseau>`.

:::


### Ecriture du docker-compose.yml

Docker vous a permis de démarrer un conteneur pour 
votre application, un conteneur pour votre base de données 
MySql etun réseau pour les associer. 
**Docker compose** permet quant à lui de réaliser 
toutes ces étapes en utilisant 
un seul fichier **docker-compose.yml** décrit ci-dessous.


```yaml title="docker-compose.yml"
services:
  app:
    build: ./demo
    container_name: spring-app
    depends_on:
      - db
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydatabase
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=rootpassword
      - SPRING_JPA_HIBERNATE_DDL_AUTO=create
      - SPRING_JPA_DEFER_DATASOURCE_INITIALIZATION=true
      - SPRING_SQL_INIT_MODE=always
    ports:
      - "8080:8080"
    networks:
      - app-network

  db:
    image: mysql:9.2.0
    container_name: mysql-db
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=mydatabase
      - MYSQL_USER=myuser
      - MYSQL_PASSWORD=mypassword
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      retries: 10
      interval: 3s
      timeout: 30s

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

:::info Détails du docker-compose.yml

Le fichier docker-compose.yml permet de déclarer plusieurs
**services**, c'est à dire des conteneurs à exécuter 
dans l'environnement Docker Compose. 

Chacun de ces services est décrit via des clés comme : 
- **build** : Indique le chemin vers un Dockerfile qui sera 
utilisé pour construire l'image du conteneur.
- **image** : Spécifie l'image Docker à utiliser pour un service,
utile si l'image ne doit pas être construite mais existe déjà.
- **container_name** : Spécifie un nom personnalisé pour 
le conteneur.
- **depends_on** : permet de s'assurer qu'un service démarre 
avant un autre **mais** ne garantit pas que le service 
dépendant soit totalement prêt à fonctionner.
- **healthcheck** : Vérifie si un service est prêt.
- **environnement** : Définit les variables d'environnement à 
passer au conteneur.
- **ports** : Définit le mapping des ports entre l'hôte 
et le conteneur.
- **network** : Permet de connecter plusieurs services 
entre eux via un réseau Docker dédié.
- **volumes** : Permet de persister les données entre les 
redémarrages d'un conteneur en utilisant des volumes Docker.
- **restart** : Définit la politique de redémarrage d'un 
conteneur en cas d'arrêt ou d'échec.

Toutes les clés sont décrites dans 
[la documentation de docker compose](https://docs.docker.com/reference/compose-file/services/). 


Le fichier docker-compose.yml permet via la clé **networks** 
de définir des réseaux personnalisés pour connecter 
les conteneurs. 
Les accès à ces réseaux sont paramètrables via
la clé **driver**.
[Les options 
de configurations sont détaillés dans la documentation](https://docs.docker.com/engine/network/drivers/).

Ce fichier docker-compose.yml permet également de déclarer 
[les volumes utiles aux services](https://docs.docker.com/reference/compose-file/volumes/).
La clé `db-data` permet de monter
un volume dans un des dossiers de Docker sur l'hote.
Le nom de ce volume peut être modifié via l'utilisation 
de la clé **name**. 

:::


Le fichier `docker-compose.yml` proposé peut se 
décomposé en :

- Un service `app` représentant le conteneur de l'application Spring Boot : 
  - Construit l'image à partir du Dockerfile présent 
  dans le dossier `./demo`.
  - Intitule le conteneur `spring-app`.
  - Dépend du conteneur intitulé `db`.
  - Définit les variables d'environnement pour la connexion MySQL.
  - Expose le port `8080`.
  - Se connecte au réseau `app-network`.

- Un service `db` représentant la Base de données MySQL : 
  - Utilise l'image disponible sur Docker Hub `mysql:9.2.0`.
  - Intitule le conteneur `mysql-db`.
  - Redémarre automatiquement en cas d'arrêt.
  - Configure une base de données `mydatabase` avec un utilisateur `myuser`.
  - Expose le port `3306`.
  - Stocke les données MySQL dans un volume `db-data`.
  - Vérifie que MySQL est prêt avant que l'application ne démarre.

- Une configuration générale : 
  - Un réseau `app-network` : 
    - Permet la communication entre les conteneurs `app` et `db`.
    - Le driver **bridge** signifie que les conteneurs connectés 
      à ce réseau peuvent communiquer entre eux mais ne sont 
      pas directement accessibles depuis l'extérieur sauf 
      via les ports explicitement exposés.
  - Un volume `db-data` : 
      - Évite la perte des données MySQL après l'arrêt des conteneurs.

Adaptez le nom du dossier prsent dans la clé `build` 
du fichier `docker-compose.yml` et essayez 
d'utiliser ce fichier avec la commade 
`docker-compose up`. 
Vous devriez pour consommer le service rest de l'application 
demo à l'adresse [localhost:8080/config](localhost:8080/config).

Si ce test est concluant supprimez les éléments créés par 
Docker compose via la commande `docker-compose down`.

### Gérer la charge avec Nginx

Votre application Spring fonctionne désormais avec une base de données 
MySQL grâce à Docker Compose. Mais dans un environnement réel, vous devez 
souvent gérer la montée en charge en équilibrant le trafic entre plusieurs 
instances de votre application. Pour cela, vous allez ajouter un 
*Load Balancer* et écrire un *docker-compose.yml*  adapté.

#### Découverte de NGINX

:::note L'instant wikipedia

NGINX est un logiciel libre de serveur Web ainsi qu'un proxy inverse écrit par Igor Sysoev, dont le développement a débuté en 2002. C'est depuis avril 2019, le serveur web le plus utilisé au monde d'après Netcraft, ou le deuxième serveur le plus utilisé d'après W3techs. 

:::

Un serveur web est un logiciel qui :
- Reçoit des requêtes HTTP/HTTPS.
- Traite ces requêtes et envoie une réponse, par exemple sous forme de page web.
- Peut héberger des fichiers statiques ou des applications dynamiques (PHP, Node.js, Java,...).

Suivez les étapes ci-dessous pour comprendre comment configurer
NGINX pour l'utiliser comme un serveur de pages statiques, 
c'est à dire, comme un serveur web qui se contente d'envoyer des
pages web telles quelles sans traitement spécifique.

Commencez par créer un dossier qui va contenir une page html que 
le serveur doit retourner.


```yaml
mkdir -p nginx-site/html
cd nginx-site
touch html/index.html
```

Ajoutez un contenu à la page `nginx-site/html/index.html`. Par exemple vous pouvez y écrire :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Laboratoires de l'unité 4DOP1DR</title>
</head>
<body>
    <h1>Bienvenue sur mon serveur Nginx avec Docker !</h1>
</body>
</html>
```

Démarrez un conteneur NGINX utilisant les fichiers créés en
 utilisant la commande suivante dans le dossier 
`nginx-site`:  

```bash
docker run -d --name nginx-site -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html:ro nginx
```

Cette commande se décompose comme suit :
- `docker run` : démarre un nouveau conteneur à partir d'une image.
- `-d`: mode détaché, le conteneur tourne en arrière-plan.
- `--name nginx-site` : donne un nom unique au conteneur.
- `-p 8080:80`: redirige le port 8080 de la machine hote vers le port 80 du conteneur, port d'écoute par défaut de NGINX.
- `$(pwd)` : pour *print working directory* retourne le chemin absolu du répertoire courant.
- `-v $(pwd)/html:/usr/share/nginx/html:ro` : monte un volume pour lier le dossier local `$(pwd)/html` au dossier `/usr/share/nginx/html` du conteneur. Le dossier du conteneur est en lecture seule (`ro`) ce qui empêche toute modification des fichiers à l'intérieur du conteneur.
- `nginx` : utilise l'image officielle de NGINX depuis Docker Hub.

Si vous allez sur [http://localhost:8080](http://localhost:8080) dans un navigateur, vous 
devriez voir apparaître le contenu de la page `nginx-site/html/index.html`.

#### NGINX comme reverse proxy

Vous avez utilisé NGINX comme un serveur web pour servir une
page statique. Mais NGINX ne se limite pas à cela. 
C'est aussi un **reverse proxy**, capable de rediriger les 
requêtes vers d'autres serveurs ou applications.
Dans ce prochain exercice, vous allez transformer votre serveur
NGINX en un tel reverse proxy.

Commencez par créer un dossier qui va contenir le fichier de configuration du serveur NGINX.


```bash
mkdir -p nginx-proxy
cd nginx-proxy
touch nginx.conf
```

Dans le fichier de configuration `nginx-proxy/nginx.conf`, ajoutez :

```json
events { }

http {
    server {
        listen 80;

        location /he2b {
            proxy_pass https://he2b.be/;
        }

        location /documents {
            proxy_pass https://sites.google.com/he2b.be/esi/documents;
        }
    }
}
```

Cette configuration peut être décomposée comme suit : 
- `events { }` : Définit des paramètres liés
aux connexions réseau, comme le nombre de connexions simultanées. Ce bloc est obligatoire dans un fichier de configuration NGINX, même si, comme ici, il est vide.
- `http { }` : Configuration principale du serveur HTTP.
- `server { }` : Déclare un serveur HTTP.
- `listen 80;` : Le serveur écoute le port 80, port par défaut pour les requêtes HTTP. Toutes les requêtes reçues sur ce port seront gérées par ce serveur.
- `location /he2b {proxy_pass https://he2b.be/;}` : Quand un utilisateur visite http://localhost/he2b, NGINX redirige la requête vers https://he2b.be/, tout en conservant la partie restante de l'URL, par exemple visiter http://localhost:8080/he2b/etudiant redirige vers https://he2b.be/etudiant.

Ce reverse proxy permet d'unifier plusieurs services sous un 
même domaine. Il peut être amélioré avec l'ajout d'en-têtes HTTP pour mieux gérer la transmission des requêtes ou par l'ajout de la gestion des requêtes HTTPS. N'hésitez pas à consulter [la documentation pour approffondir les possibilités](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

Démarrez votre reverse proxy via la commande :  

```bash
docker run -d --name nginx-proxy -p 8081:80 -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx
```

Testez que vous avez bien accès aux pages (attention au numéro de port !).

:::note Exercice 5 : Decryptage d'une commande

Ecrivez sur une feuille la signification de chaque paramètre de
la commande afin de vous assurer de votre compréhenssion de 
l'utilisation des conteneurs.

:::

#### NGINX avec une application personnelle

Si vous souhaitez utiliser NGINX pour rediriger vers
l'application conteneurisée `demo-no-db`, vous allez devoir
demander à Docker de créer un réseau pour que le
conteneur NGINX et le conteneur Spring-Boot communiquent.

Si ils existent toujours, commencez par supprimer les conteneurs des serveurs NGINX et 
de l'application `demo-no-db`. 

Ensuite pour créer le réseau il suffit d'utiliser la commande : 

```bash
docker network create my-network-test
```

L'étape suivante consiste à démarrer un conteneur utilisant l'image de l'application 
`g12345/spring-demo-no-db` en la connectant à ce réseau grâce à
l'option `--network` : 

```bash
docker run --rm --name no-db --network my-network-test -p 8082:8080 g12345/spring-demo-no-db
```

Modifiez la configuration du 
reverse proxy pour que la route `demo-no-db` 
redirige vers la route `/config` de l'appliction `demo-no-db`.

```json title="nginx.conf"
events { }

http {
    server {
        listen 80;

        location /he2b {
            proxy_pass https://he2b.be/;
        }

        location /demo-no-db {
            proxy_pass http://no-db:8080/config;
        }
    }
}
```

Finalement démarrer un conteneur NGINX associé au réseau. 
Prenez attention que cette commande s'exécute dans le dosier 
contenant le fichier `nginx.conf` vu la présence du `$(pwd)`.

```bash
docker run -d --name nginx-proxy --network my-network-test -p 8081:80 -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx
```

Si vous consultez dans un brownser l'url `http://localhost:8081/demo-no-db` vous devriez recevoir les données du service rest.

Supprimez les conteneurs créés avant de passer à l'étape suivante.

#### Simplification grâce à Docker Compose

Docker vous a permis de démarrer un conteneur pour votre application
et un conteneur pour votre reverse proxy NGINX.
Docker compose permet quant à lui de réaliser le démarrage de ces deux applications en **un seul fichier**
`docker-compose.yml`.

```yaml title="docker-compose.yml"
services:
  app:
    # Chemin vers le répertoire contenant le Dockerfile
    build: ./
    image: g12345/spring-demo-no-db
    container_name: no-db
    ports:
      - "8082:8080"
    networks:
      - app-network

  nginx:
    image: nginx:latest
    container_name: nginx-proxy
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:80"
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Adaptez le nom des images ou des dossiers du fichier 
`docker-compose.yml` et essayez d'utiliser ce fichier avec 
la commade `docker-compose up`. 
Vous devriez pouvoir consommer le service rest de 
l'application `demo-no-db` à l'adresse `http://localhost:8080/demo-no-db`.

Consultez ensuite les conteneurs dispnibles via `docker ps -a`.
Vous devriez y trouver les conteneurs concernant NGINX et demo-no-db. 
Utilisez la commande `docker-compose down` et consulter à nouveau la liste 
des conteneurs disponibles. Que constatez-vous ?

:::tip Forcer la reconstruction

La commande docker-compose up démarre les conteneurs définis 
dans le fichier docker-compose.yml. Si les images nécessaires 
n'existent pas, elles sont construites sinon elles ne sont pas 
reconstuites et la version disponible sur l'hote est utilisée.
Si vous ajoutez l'option --build la **reconstruction** des images
est **forcée** même si elles existent déjà.

```
docker-compose up --build
```

:::

#### NGINX comme load balancer

Dans l'exercice précédent, vous avez configuré NGINX comme
reverse proxy pour une application Spring Boot. 
Cependant, lorsqu'une application reçoit un grand nombre de 
requêtes, un seul serveur Spring Boot peut devenir un goulet 
d'étranglement et ralentir les performances. 
Pour y remédier, il est courant d'utiliser plusieurs instances 
de l'application et de répartir la charge entre elles.

Dans cet exercice, vous allez utiliser Docker Compose pour
configurer NGINX en tant que Load Balancer. 
L'objectif est de :
- Lancer plusieurs instances de l'application Spring Boot dans des conteneurs Docker.
- Configurer NGINX pour équilibrer la charge entre ces instances.
- Vérifier que les requêtes sont distribuées entre les différentes instances.

Le fichier docker-compose.yml pour cette configuration est
disponible ci-dessous.

```yaml title="docker-compose.yml"
services:
  app1:
    build: ./
    container_name: demo-no-db-1
    environment:
      - SERVER_PORT=8081
    networks:
      - app-network

  app2:
    build: ./
    container_name: demo-no-db-2
    environment:
      - SERVER_PORT=8082
    networks:
      - app-network

  app3:
    build: ./
    container_name: demo-no-db-3
    environment:
      - SERVER_PORT=8083
    networks:
      - app-network

  nginx:
    image: nginx:latest
    container_name: nginx-load-balancer
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:80"
    depends_on:
      - app1
      - app2
      - app3
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

La configuration du serveur NGINX pour l'utiliser comme
load balancer est la suivante : 


```json
events { }

http {
    upstream spring-backend {
        server app1:8081;
        server app2:8082;
        server app3:8083;
    }

    server {
        listen 80;

        location /demo-no-db {
            proxy_pass http://spring-backend/config;
        }
    }
}
```

Démarrez vos conteneurs et lancez plusieurs fois la 
commande `curl http://localhost:8080/demo-no-db/` pour consommer
le service rest de l'application `demo-no-db`. 

Est-ce que le résultat affiché est toujours le même ?

