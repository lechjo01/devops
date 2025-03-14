import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 07 - Gitlab CI/CD

GitLab CI/CD (Continuous Integration / Continuous Deployment) est un outil puissant qui permet d'automatiser le processus de développement logiciel, du test au déploiement. Il repose sur des pipelines, composés de jobs s'exécutant dans des stages, afin de garantir la qualité et la rapidité des livraisons.

Dans cette série d'exercices, vous apprendrez à configurer un pipeline GitLab CI/CD, à automatiser les tests et à déployer des applications de manière efficace. 


### Objectifs 

À l’issue de ce TD, vous serez capable d' :

- déployer une application sur Alwaysdata

:::warning Pré-requis

1. Connaissance de base en Java, Python, Docker et des commandes shell.
1. Un environnement de travail prêt avec Java (JDK 17 minimum), Python 3.8+ et un IDE.
1. Notions de base sur Git et GitLab
1. Bases sur les fichiers YAML

:::

## Installation

### Installation du runner

Un GitLab Runner est un programme qui exécute les tâches définies dans un pipeline GitLab CI/CD. Il prend en charge l’exécution des jobs (tests, compilation, déploiement...) spécifiés dans le fichier .gitlab-ci.yml.

Les runners peuvent être partagés (gérés par GitLab) ou spécifiques (installés sur une machine privée). Ils s’exécutent dans différents environnements (Docker, shell, Kubernetes…) et permettent d'automatiser le processus de développement. 


Afin de d'éviter d’installer les dépendances sur votre machine hôte et de garantir un environnement identique à chaque exécution, installez un runner sur votre machine dans un environnements Docker en utilisant [l'image gitlab-runner](https://docs.gitlab.com/runner/install/docker/).


Pour faciliter la communication entre les services Docker et GitLab Runner, 
vous allez utiliser un socket unix.

:::tip socket

Un socket est un point de communication utilisé pour échanger des données entre des processus. Il permet la communication entre applications, soit localement sur une même machine, soit à distance via un réseau.

`/var/run/docker.sock` est un socket UNIX utilisé pour communiquer avec le daemon Docker (dockerd) sans passer par une connexion réseau. Il permet aux processus locaux (comme un GitLab Runner ou un autre conteneur) de contrôler Docker sur la machine hôte.

:::

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

  Exécutez la commande ci-dessous pour démarrer le runner : 

  ```sh
  docker run -d --name gitlab-runner --restart always -v /srv/gitlab-runner/config:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock gitlab/gitlab-runner:latest
  ```

  Le dossier`/srv` existe par défaut et est destiné à héberger des données de services (serveurs web, applications…).
  Sur certaines distributions minimalistes ou personnalisées, il peut être absent, et il faut alors le créer manuellement. Le dossier `/srv/gitlab-runner/config` est utilisé pour stocker la configuration persistante du GitLab Runner. 

 </TabItem>
  <TabItem value="win" label="Windows/macOS">

  Sous Windows, Docker fonctionne via Docker Desktop, qui crée une machine virtuelle Linux pour exécuter les conteneurs. Cette séparation complique la communication entre GitLab Runner et Docker, notamment si Docker s'exécute en dehors de WSL (Windows Subsystem for Linux). Si on active WSL 2, on peut simplement utiliser le socket UNIX (/var/run/docker.sock), comme sous Linux.

  Si ce n'est déjà fait, commencez par installer Ubuntu via WSL via la commande

  ```sh
  wsl  --install Ubuntu
  ```

  Afin de garantir que toute nouvelle distribution installée utiliseront WSL 2, utilisez la commande

  ```sh
  wsl --set-default-version 2 wsl --set-version Ubuntu
  ```

  Dans Docker Desktop, [changez la configuration de Docker pour utiliser WSL](https://docs.docker.com/desktop/settings-and-maintenance/settings/).


  Créez un dossier qui servira de volume pour conserver la configuration du runner

  ```sh
  mkdir chemin_absolu_vers_la_configuration/gitlab-runner/config
  ```

  Utiliser les commandes ci-dessous  
 
  ```sh
  docker run -d --name gitlab-runner --restart always -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock gitlab/gitlab-runner:latest
  ```

  </TabItem>
</Tabs>

### Création du token pour un projet

Un GitLab Runner doit être enregistré auprès d’un projet GitLab pour exécuter ses pipelines. 
Pour cela, il a besoin d’un token d’enregistrement, qui sert à authentifier le runner et à l’associer au projet.
Afin de créer ce token 

- Créez un projet sur gitlab.
- Dans le menu du projet Settings > CI/CD, ouvrez la section Runners.
- Créez le runner via le bouton New project runner.
- Cochez la case Run untagged jobs
- Copiez le runner authentication token avant qu'il ne disparaisse.
- Exportez la valeur du token dans la variable RUNNER_TOKEN.

### Enregistrement d'un runner

Pour enregistré le runner de votre machine hôte, il faut exécuter
la commande register du conteneur gitlab-runner : 

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

```sh
docker run --rm -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner register \
  --non-interactive \
  --url "https://git.esi-bru.be" \
  --token "$RUNNER_TOKEN" \
  --executor "docker" \
  --docker-image alpine:latest \
  --description "docker-runner"
```

 </TabItem>
  <TabItem value="win" label="Windows/macOS">

```sh
docker run --rm -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner gitlab/gitlab-runner register  --non-interactive --url "https://git.esi-bru.be" --token "$RUNNER_TOKEN" --executor "docker" --docker-image alpine:latest --description "docker-runner"
```

  </TabItem>
</Tabs>

La commande register utilise les paramètres suivants : 

- `--non-interactive` : Indique que l'enregistrement du runner doit se faire sans interaction utilisateur, ce qui est essentiel pour inclure la commande dans un script.
- `--url "https://git.esi-bru.be"` : Spécifie l'URL de votre instance GitLab. 
- `--token "$RUNNER_TOKEN"` : Utilise le token d'enregistrement contenu dans la variable d'environnement $RUNNER_TOKEN.
- `--executor "docker"` : Définit l'exécuteur, c'est à dire l'environnement d'exécution utilisé par le runner.
- `--docker-image alpine:latest` : Spécifie l'image Docker à utiliser pour exécuter les jobs.
- `--description "docker-runner"` : Fournit une description pour le runner, qui permet de l'identifier dans l'interface GitLab.

Pour vérifier si le succès de l'enregistrement, consulter la liste des runners de votre projet via le menu Settings > CI/CD.

## Premier script

### Hello World

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
```

### Variables du projet

Créer une variable via le menu **Settings > CI/CD/ Variables**

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
    - echo "La valeur de MY_VARIABLE est '$MY_VARIABLE'"
```

### Variables prédéfinies

Plusieurs variables sont prédéfinies pour le runner.
On trouve par exemple CI_COMMIT_AUTHOR contenant l'auteur du commit
ou encore CI_COMMIT_BRANCH contenant la branche sur laquelle le commit a été effectué.

Afin de vous faire une idée des variables disponibles, modifiez
votre script comme ci-dessous : 

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Début du job de déploiement - Version du serveur GitLab : $CI_SERVER_VERSION"
    - echo "Utilisateur GitLab : $GITLAB_USER_LOGIN"
    - echo "Projet : $CI_PROJECT_URL"
    - echo "Environnement cible : $CI_ENVIRONMENT_NAME"
    - echo "Commit effectué à : $CI_COMMIT_TIMESTAMP"
    - echo "Message du commit : $CI_COMMIT_MESSAGE"
    - echo "Branche de commit : $CI_COMMIT_BRANCH"
    - echo "Auteur du commit : $CI_COMMIT_AUTHOR"
    - echo "Hello World!"
    - echo "La valeur de MY_VARIABLE est '$MY_VARIABLE'"
```

Vous pouvez consulter la [liste des variables prédéfinies](https://docs.gitlab.com/ci/variables/predefined_variables/).

### Execution failed

Utiliser la commande maven dans le script

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - mvn --version
```

Statut **failed** du job via le menu **Build > Jobs**

```bash
$ mvn --version
/bin/sh: eval: line 151: mvn: not found
Cleaning up project directory and file based variables 00:00
ERROR: Job failed: exit code 127
```

### Before et after script

Utiliser la commande before_script

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  before_script:
    - apk add --no-cache maven
  script:
    - mvn --version
```
Statut **Passed** du job via le menu **Build > Jobs**

```bash
...
(1/30) Installing java-common (0.5-r0)
...
Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)
...
```

### Default et image

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  image: maven:3.9.9-eclipse-temurin-23-alpine
  before_script:
  - cd demo-no-db
  script:
    - mvn test
    - mvn package -DskipTests
```

## Définition d'un pipeline

### Stages et dépendances

```yaml title="gitlab-ci.yml" showLineNumbers
stages:
  - test
  - build

job-test:
  stage: test
  image: maven:3.9.9-eclipse-temurin-23-alpine
  before_script:
  - cd demo-no-db
  script:
    - mvn test
job-build:
  stage: build
  image: maven:3.9.9-eclipse-temurin-23-alpine
  before_script:
  - cd demo-no-db
  script:
    - mvn package -DskipTests
```

### Variable globales

```yaml title="gitlab-ci.yml" showLineNumbers
default:
  image: maven:3.9.9-eclipse-temurin-23-alpine

stages:
  - test
  - build

variables:
  WORK_DIR: "demo-no-db"

job-test:
  stage: test
  before_script:
  - cd $WORK_DIR
  script:
    - mvn test
job-build:
  stage: build
  before_script:
  - cd $WORK_DIR
  script:
    - mvn package -DskipTests    
```

### Ajout d'une cache

- Le caching permet d'améliorer les performances en évitant de re-télécharger des dépendances ou de recompiler du code déjà construit.
- Il est défini au niveau des jobs dans .gitlab-ci.yml.
- Les caches sont stockés sur le runner et peuvent être partagés entre différents jobs.
- Exemple d'utilisation pour un projet Maven :

```yaml title="gitlab-ci.yml" showLineNumbers
cache:
  paths:
    - .m2/repository/
script:
    - mvn test -Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository
```

### Exécution conditionnée

```yaml title="gitlab-ci.yml" showLineNumbers
job_build:
  script:
    - mvn package -DskipTests
  only:
    - main
    - develop
```

### Workflow

```yaml title="gitlab-ci.yml" showLineNumbers

```

### Docker in Docker

```yaml title="gitlab-ci.yml" showLineNumbers
docker_build:
  stage: docker_build
  image: docker:20.10.16  # Utilise l'image Docker pour construire l'image
  services:
    - docker:20.10.16-dind  # Active Docker-in-Docker
  script:
    - docker build -t $DOCKER_USERNAME/4dop1dr-image:$CI_COMMIT_REF_NAME .
  variables:
    DOCKER_TLS_CERTDIR: "/certs"  # Nécessaire pour Docker-in-Docker
```

### Secrets et clés



### Analyse avec SonarQube

```yaml title="gitlab-ci.yml" showLineNumbers
stages:
  - test
  - analyze

test:
  script:
    - mvn test
    - mvn jacoco:report

sonarqube:
  image: sonarsource/sonar-scanner-cli
  stage: analyze
  script:
    - sonar-scanner \
      -Dsonar.host.url=http://sonarqube:9000 \
      -Dsonar.login=$SONAR_TOKEN
  dependencies:
    - test
```

Le runner GitLab doit être connecté au même réseau Docker que SonarQube Server. Le conteneur sonaqube est utilisé dans la variable passée la commande sonar-scanner : `-Dsonar.host.url=http://sonarqube:9000`

```sh
docker network connect sonar-network gitlab-runner
```


### Déploiement sur Alwaysdata

Les variables d'environnements, de la console web au fichier .bashrc ou .profile.

Un redémarrage nécessaire.
Redémarrage manuel

Redémarrage via l'api


```yaml title="gitlab-ci.yml" showLineNumbers

```

## Exercice : Créer un pipeline de déploiement

- Créez un dépôt avec l'application spring boot demo dans le groupe 2024-2025/devops-labos intitulé g12345-ci, g12345 doit être remplacé par votre matricule
- Placez-y le fichier Dockerfile et docker-compose.yml
- Placez-y les fichiers ignore
- Placez-y le sonar-project.properties
- Créez le fichier gitlab-ci.yml

Le pipeline doit : 
- Utiliser une cache pour maven
- Se déclencher uniquement si un tag Release est utilisé
- Vérifier que l'application compile
- Vérifier que les test unitaires s'exécutent avec succès
- Vérifier que les conteneurs Docker sont opérationnels
- Vérifier que la qualité du code est suffisante
- Déploie l'application sur Alwaysdata (mise à jour des variables d’environnement, copie du jar, démarrage de l'application)
- Si une des étapes échouent le pipeline doit échouer

La structure du projet ressemble à :

```sh
my-project/
│
├── Dockerfile                  # Définition de l'image Docker
├── docker-compose.yml          # Configuration des services Docker
│
├── .gitignore                  # Fichier pour ignorer certains fichiers (ex. fichiers Terraform, Docker)
├── README.md                   # Documentation du projet
├── .dockerignore               # Fichier pour ignorer certains fichiers dans Docker
├── gitlab-ci.yml          # Configuration du pipeline
└── src/                        # Code de l'application
```