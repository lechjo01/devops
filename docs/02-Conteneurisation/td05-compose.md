# TD 05 - Docker-compose

Vous avez maintenant acquis les bases de Docker et appris à écrire 
des Dockerfile pour créer et exécuter des conteneurs. 
Cette série d’exercices va vous permettre d’aller plus loin en explorant 
des concepts essentiels pour le déploiement et l’orchestration 
d’applications conteneurisées.

Vous commencerez par approfondir le comportement des conteneurs 
avec la différence entre `ENTRYPOINT` et `CMD`, puis vous verrez comment 
optimiser vos images Docker grâce au fichier `.dockerignore`. 
Ensuite, vous apprendrez à gérer la mise à jour d’un conteneur 
via un script d’automatisation.

Une fois ces bases maîtrisées, vous aborderez *Docker Compose*, 
un outil indispensable pour gérer plusieurs conteneurs. 
Vous créerez des configurations *docker-compose.yml* pour orchestrer 
une application Spring avec une base de données MySQL, puis avec un 
*load balancer Nginx*. Enfin vous conclurez par une introduction aux microservices, 
où Docker Compose sera utilisé pour déployer une architecture distribuée.

### Objectifs 

À l’issue de ce TD, vous serez capable de :

1. Comprendre les mécanismes avancés de Docker.
1. Optimiser les images et les conteneurs.
1. Automatiser le cycle de vie des services.
1. Orchestrer des applications complexes avec Docker Compose.


:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum),
 un IDE (VS Codium) et Docker.
1. Connaissance de base de Docker ses images et ses conteneurs.

:::

## Docker
 
Dans cette section, vous allez approfondir certaines notions essentielles 
qui n’ont pas encore été abordées concernant Docker.

### ENTRYPOINT ou CMD

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

Vous devez constater via cette inspection que la valeur de la direcive **CMD** est `/bin/sh`.
Ce qui signifie que la commande `docker run` effectue : 
- la création du conteneur à partir de alpine.
- l'execution de la commande `/bin/sh` dans alpine.
- dès que la commande `/bin/sh` s'arrête le conteneur s'arrête.

Avant de passer à la suite, effacez ce conteneur de test, en utilisant la commande `docker rm test-no-entrypoint-no-cmd`.

:::tip

Lorsque vous démarrez des conteneurs temporaires, vous pouvez les effacer automatiquement après leur exécution en utilisant le flag `-rm` comme ci-dessous.

```bash
docker run --rm test-no-entrypoint-no-cmd
```

:::

Modifiez votre Dockerfile et créez une image écrasant la directive **CMD** : 


```Dockerfile title="Dockerfile"
FROM alpine:latest

CMD ["echo", "Hello, World!"]
```

Construisez l'image `test-no-entrypoint-cmd`, démarrez
un conteneur pour tester cette image.

La commande `docker run` effectue : 
- la création du conteneur à partir de alpine.
- l'execution de la commande `/bin/echo "Hello, World!"` dans alpine.
- dès que la commande `/bin/echo` s'arrête le conteneur s'arrête.

Si vous essayez de démarrer le même conteneur en passant
un argument comme dans la commande suivante, une erreur apparait.

```bash
docker run --rm test-no-entrypoint-no-cmd "Bonjout tout le monde"
```

Il semble impossible de pouvoir passer un argument à `docker run` avec cette image.

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

:::note ENTRYPOINT ou CMD
**ENTRYPOINT** est utilisé pour définir un programme 
principal qui **s'exécutera toujours**, même si des 
arguments sont passés.
**CMD** définit des **arguments par défaut** pour ENTRYPOINT, 
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
## Dossier contenant l’historique Git
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
- Évitez d’installer des outils inutiles.

:::

## Docker compose

Gérer plusieurs conteneurs manuellement peut vite devenir complexe. 
Docker Compose simplifie cette gestion en permettant de définir et orchestrer 
plusieurs services dans un simple fichier YAML.

### Manipulation de YAML

Avant de pouvoir tirer pleinement parti de Docker Compose, il est essentiel de maîtriser
la syntaxe des fichiers YAML. 
Une bonne compréhension de YAML vous permettra de structurer correctement vos fichiers 
`docker-compose.yml` et d'éviter les erreurs courantes.

Un fichier YAML (Yet Another Markup Language) est un format de 
données utilisé pour stocker et échanger des informations 
structurées. Les données sont représentées sous forme de paires
`clé: valeur`. Ce format utilise **uniquement** les espaces pour l’indentation.

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

:::note Exercice : YAML et erreurs courantes

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
url: http://example.com/path:80
```

#### Exemple 4

```yaml
description: This is a test: with a colon
```

#### Exemple 5

```yaml
message: This is a test # with a comment caracter
```
:::

### Déployer une application avec Docker Compose

#### Dockerfile pour une application avec base de données

Ecrire le Dockerfile permettant de
lancer l'application Spring-boot demo via la 
commande

```bash
docker run -d -e 
spring.datasource.url=jdbc:mysql://db:3306/mydatabase?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootpassword
spring.jpa.hibernate.ddl-auto=update
spring.sql.init.mode=always
... spring-demo
```

#### Ecriture du docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: ./app
    container_name: spring-app
    depends_on:
      - db
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydatabase?useSSL=false&allowPublicKeyRetrieval=true
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=rootpassword
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
    ports:
      - "8080:8080"
    networks:
      - app-network

  db:
    image: mysql:8.0
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

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```


### Gérer la charge avec Nginx

Votre application Spring fonctionne désormais avec une base de données 
MySQL grâce à Docker Compose. Mais dans un environnement réel, vous devez 
souvent gérer la montée en charge en équilibrant le trafic entre plusieurs 
instances de votre application. Pour cela, vous allez ajouter un *Load Balancer* 
avec *Nginx* et adapter votre *docker-compose.yml* en conséquence.


#### Utiliser nginx comme serveur web

:::note wikipedia

NGINX est un logiciel libre de serveur Web (ou HTTP) ainsi qu'un proxy inverse écrit par Igor Sysoev, dont le développement a débuté en 2002. C'est depuis avril 2019, le serveur web le plus utilisé au monde d'après Netcraft, ou le deuxième serveur le plus utilisé d'après W3techs. 

:::

Peut servir des pages HTML statiques

```yaml
mkdir -p nginx-site/html
cd nginx-site
touch html/index.html
touch nginx.conf
```

Dans nginx-site/html/index.html, ajoutez :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon serveur Nginx pour leslabos de 4dop1dr</title>
</head>
<body>
    <h1>Bienvenue sur mon serveur Nginx avec Docker !</h1>
</body>
</html>
```

Lancer la commande

```bash
docker run -d --name nginx-site -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html:ro nginx
```

Dans un navigateur, allez sur http://localhost:8080 et vous devriez voir votre page personnalisée.

#### Utiliser nginx comme reverse proxy


Agit comme un intermédiaire entre les clients et un serveur backend (ex : Node.js, Python, Java).

Sécurise les requêtes en masquant l’IP du backend.


```bash
mkdir -p nginx-proxy
cd nginx-proxy
touch nginx.conf
```

Dans nginx-proxy/nginx.conf, ajoutez :

```json
events { }

http {
    server {
        listen 80;

        location /he2b {
            proxy_pass https://he2b.be/;
        }

        location /google {
            proxy_pass https://www.google.be/;
        }
    }
}
```

Lancer la commande 

```bash
docker run -d --name nginx-proxy -p 8081:80 -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx
```

Pour utiliser une application personnel


```yaml
version: '3.8'

services:
  app:
    build: ./app
    container_name: spring-app
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
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

#### Utiliser nginx comme load balancer

Distribue le trafic entre plusieurs serveurs backend pour éviter la surcharge.

```yaml
version: '3.8'

services:
  app1:
    build: ./app
    container_name: spring-app-1
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SERVER_PORT=8081
    networks:
      - app-network

  app2:
    build: ./app
    container_name: spring-app-2
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SERVER_PORT=8082
    networks:
      - app-network

  app3:
    build: ./app
    container_name: spring-app-3
    environment:
      - SPRING_PROFILES_ACTIVE=prod
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

Modifiez la configuration : 


```json
events { }

http {
    upstream spring_backend {
        server app1:8081;
        server app2:8082;
        server app3:8083;
    }

    server {
        listen 80;

        location /api/ {
            proxy_pass http://spring_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Lancer plusieurs fois la commande `curl http://localhost:8080/config/`. Est-ce que le numéro de port est identique ?

### Microservices et Docker Compose

Jusqu'à présent, vous avez travaillé avec des applications monolithiques 
ou des services simples. 
Les microservices permettent de diviser une application en plusieurs services indépendants, chacun ayant son propre rôle.

Vous allez voir comment Docker Compose facilite le déploiement et la gestion des microservices, en définissant plusieurs conteneurs interconnectés dans un seul fichier docker-compose.yml.

