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

Vous avez déjà appris à écrire des Dockerfile et à créer vos propres images Docker. 
Dans cette section, vous allez approfondir certaines notions essentielles 
qui n’ont pas encore été abordées.

### ENTRYPOINT ou CMD

Lorsque vous utilisez des Dockerfiles, vous constatez
que deux instrutions assez proches sont utilisées pour 
demander d'exécutez une action au démarage du conteneur
`CMD` et `ENTRYPOINT`.

Afin d'y voir plus clair dans la distinction entre ces 
deux directives, créez un Dockerfile à partir d'une image alpine


```Dockerfile title="Dockerfile"
FROM alpine:latest
```

Créez l'image associée à ce Dockerfile

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

Démarrez un conteneur basé sur cette image via la commande : 

```bash
docker run test-no-entrypoint-no-cmd
```

Le conteneur démarre et aucune action en semble avoir été exécutée. Inspectez la configuraion de l'image et **cherchez** la valeur des directives CMD et Entrypoint de ce conteneur.

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

Lorsque vous démarrez des conteneurs temporaires, vous pouvez les effacer automatiquement arès leur exécution en utilisant le flag `-rm` comme ci-dessous

```bash
docker run --rm test-no-entrypoint-no-cmd
```

:::

Modifiez votre Dockerfile et créez une image écrasan la directive **CMD** : 


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

Si vous essayer de démarrer le même conteneur en passant
un argument, une erreur apparait.

```bash
docker run --rm test-no-entrypoint-no-cmd "Bonjout tout le monde"
```

Il semble impossible de pouvoir passer un argument à docker run avec cette image.

Effacez votre conteneur et modifiez votre Dockerfile pour
ajouter la direcive **ENTRYPOINT** ajoutant la possibilité de gérer des arguments.

```Dockerfile title="Dockerfile"
FROM alpine:latest  

ENTRYPOINT ["echo"]

CMD ["Hello, World!"]
```

Construisez l'image `test-entrypoint-cmd`, démarrez
un conteneur pour tester cette image.
Vous constatez que "Hello, World!" s'affiche dans
le terminal.

Si vous essayez à nouveau de passer un argument, vous constaterez que la valeur donnée à la directive **CMD**
a été écrasée.

```bash
docker run --rm test-entrypoint-cmd "Bonjout tout le monde"
```

:::note ENTRYPOINT ou CMD
**ENTRYPOINT** est utilisé pour définir un programme 
principal qui **s'exécutera toujours**, même si des 
arguments sont passés.
**CMD** définit des **arguments par défaut** pour ENTRYPOINT, 
mais peut être remplacé si des arguments sont fournis au 
docker run.
:::

Un tableau récapitulatif est disponible sur la [documentation des directives de docker](https://docs.docker.com/reference/dockerfile/#understand-how-cmd-and-entrypoint-interact).

### Optimiser la taille des images Docker

Vous avez vu comment `ENTRYPOINT` et `CMD` influencent le comportement 
d'un conteneur au démarrage. Cependant, lorsqu'on construit une image 
Docker, il est essentiel de ne pas inclure des fichiers inutiles pour 
optimiser la taille et la sécurité. C'est là qu'intervient `.dockerignore`, 
qui vous permet de contrôler ce que Docker copie dans l'image. 
Voyons comment l'utiliser efficacement.

Exercice


:::info Optimiser la taille des images Docker

A travers les exercices vous pouvez noter plusieurs techniques d'optimisation : 

- Utiliser une image de base légère
- Utiliser .dockerignore
- Minimiser le nombre de couches (RUN en une seule commande)
- Utiliser multi-stage builds
- Nettoyer les dépendances temporaires
- Éviter d’installer des outils inutiles

:::


### Automatiser la mise à jour d’un conteneur

Grâce à *.dockerignore*, vous avez appris à alléger vos images 
Docker en excluant les fichiers inutiles. Mais une fois votre 
application empaquetée, vous devez pouvoir la mettre à jour proprement. 
Voyons maintenant comment écrire un script permettant d'arrêter un conteneur, 
le supprimer et le redémarrer avec une version plus récente.

## Docker compose

Gérer plusieurs conteneurs manuellement peut vite devenir complexe. 
Docker Compose simplifie cette gestion en permettant de définir et orchestrer 
plusieurs services dans un simple fichier YAML.

### Manipulation de YAML

Avant de pouvoir tirer pleinement parti de Docker Compose, il est essentiel de maîtriser
la syntaxe des fichiers YAML. 
Une bonne compréhension de YAML vous permettra de structurer correctement vos fichiers 
docker-compose.yml et d'éviter les erreurs courantes.



### Déployer une application avec Docker Compose

Vous savez maintenant comment gérer un conteneur individuellement. 
Cependant, dans une application réelle, vous avez souvent plusieurs 
services qui doivent fonctionner ensemble, comme une application Spring 
et une base de données MySQL. Pour simplifier la gestion de ces services 
interconnectés, vous allez utiliser *Docker Compose* et écrire un fichier 
`docker-compose.yml` pour orchestrer notre environnement.


### Gérer la charge avec Nginx

Votre application Spring fonctionne désormais avec une base de données 
MySQL grâce à Docker Compose. Mais dans un environnement réel, vous devez 
souvent gérer la montée en charge en équilibrant le trafic entre plusieurs 
instances de votre application. Pour cela, vous allez ajouter un *Load Balancer* 
avec *Nginx* et adapter votre *docker-compose.yml* en conséquence.

### Microservices et Docker Compose

Jusqu'à présent, vous avez travaillé avec des applications monolithiques 
ou des services simples. 
Les microservices permettent de diviser une application en plusieurs services indépendants, chacun ayant son propre rôle.

Vous allez voir comment Docker Compose facilite le déploiement et la gestion des microservices, en définissant plusieurs conteneurs interconnectés dans un seul fichier docker-compose.yml.

