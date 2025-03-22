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

Pour utiliser GitLab CI/CD, vous devrez :

1. Lancer un conteneur exécutant les instructions transmises par 
GitLab, appelé GitLab Runner.
1. Générer un token permettant à ce GitLab Runner de communiquer 
avec le serveur GitLab.
1. Enregistrer ce GitLab Runner, s'exécutant sur votre machine 
hôte, auprès du serveur GitLab.

:::tip Définition de pipeline et de jobs dans GitLab CI/CD

Un **pipeline** est un processus automatisé qui exécute une série 
de **jobs** définis dans un fichier *.gitlab-ci.yml*.

Un **job** est une unité d’exécution définie dans le fichier 
*.gitlab-ci.yml*. Il correspond à une tâche spécifique à exécuter 
dans le pipeline, comme :

- Exécuter des tests
- Construire un projet
- Déployer une application

:::

### Installation du runner

Un **GitLab Runner** est un programme qui exécute les tâches 
définies dans un pipeline GitLab CI/CD. 
Il prend en charge l’exécution des **jobs** spécifiés dans un 
fichier `.gitlab-ci.yml`.

Les runners peuvent être partagés, c'est à dire gérés par le 
serveur GitLab ou spécifiques et installés sur une machine privée. 
Ils s’exécutent dans différents environnements (Docker, shell, …) 
et permettent d'automatiser le processus de développement. 


Afin d'éviter d’installer les dépendances sur votre machine hôte et de garantir un environnement identique à chaque exécution, vous allez installer un runner sur votre machine dans un environnements Docker en utilisant l'image gitlab-runner. 
La procédure d'installation décrite ci-dessous s'inspire de 
[la documentation sur gitlab-runner](https://docs.gitlab.com/runner/install/docker/).
N'hésitez pas à la consulter si vous souhaitez découvrir plus de possibilités d'installation.


Pour faciliter la communication entre les services Docker et 
GitLab Runner, vous allez utiliser un **socket** unix.

:::tip socket

Un socket est un point de communication utilisé pour échanger des 
données entre des processus. Il permet la communication entre 
applications, soit localement sur une même machine, soit à 
distance via un réseau.

En particulier `/var/run/docker.sock` est un socket UNIX utilisé pour communiquer 
avec le daemon Docker (*dockerd*) sans passer par une connexion 
réseau. Il permet aux processus locaux, comme un GitLab Runner ou 
un autre conteneur, de contrôler Docker sur la machine hôte.

:::

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

  Exécutez la commande ci-dessous pour démarrer le runner : 

  ```sh
  docker run -d \
    --name gitlab-runner \
    --restart always \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gitlab/gitlab-runner:latest
  ```

  Le dossier`/srv` existe par défaut sur votre machine hôte et est
  destiné à héberger des données de services (serveurs web, 
  applications…).
  Sur certaines distributions minimalistes ou personnalisées, il 
  peut être absent, et il faut alors le créer manuellement. 
  Le dossier `/srv/gitlab-runner/config` est utilisé pour stocker 
  la **configuration persistante du GitLab Runner**. 

 </TabItem>
  <TabItem value="win" label="Windows">

  Sous Windows, Docker fonctionne via Docker Desktop, qui crée une 
  machine virtuelle Linux pour exécuter les conteneurs. 
  Cette séparation complique la communication entre GitLab Runner 
  et Docker, notamment si Docker s'exécute en dehors de WSL 
  (Windows Subsystem for Linux). 
  Par contre si vous activez WSL 2, vous pouvez simplement 
  utiliser le socket unix `/var/run/docker.sock`, comme sous Linux.

  Si ce n'est déjà fait, commencez par installer Ubuntu via WSL
  via la commande ci-dessous : 

  ```sh
  wsl  --install Ubuntu
  ```

  Afin de garantir que toute nouvelle distribution installée 
  utilisera WSL 2, exécutez la commande suivante : 

  ```sh
  wsl --set-default-version 2 wsl --set-version Ubuntu
  ```

  Dans Docker Desktop, 
  [changez la configuration de Docker pour utiliser WSL](https://docs.docker.com/desktop/settings-and-maintenance/settings/).


  Ensuite créez un dossier qui servira de volume pour conserver la 
  configuration du runner grâce à la commande ci-dessous, 
  `chemin_absolu_vers_la_configuration` est à remplacer par le dossier de votre choix :

  ```sh
  mkdir chemin_absolu_vers_la_configuration/gitlab-runner/config
  ```

  Finalement utilisez la commande suivante pour démarrer le 
  runner : 
 
  ```sh
  docker run -d ^
    --name gitlab-runner ^
    --restart always ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    -v /var/run/docker.sock:/var/run/docker.sock ^
    gitlab/gitlab-runner:latest
  ```

  Le caractère ^ (accent circonflexe) est utilisé
  pour continuer une commande sur plusieurs lignes.

  </TabItem>
</Tabs>

### Création du token pour un projet

Un GitLab Runner doit être enregistré auprès d’un projet GitLab 
pour exécuter ses pipelines. 
Pour cela, il a besoin d’un token d’enregistrement, qui sert à 
authentifier le runner et à l’associer au projet.
Afin de créer ce token  : 

- Créez un projet [sur GitLab](https://git.esi-bru.be).
- Dans le menu du projet *Settings > CI/CD*, ouvrez la section *Runners*.
- Créez le runner via le bouton *New project runner*.
- Cochez la case *Run untagged jobs*.
- Copiez le runner authentication token avant qu'il ne disparaisse.
- **Exportez** la valeur du token dans la variable **RUNNER_TOKEN**.

:::tip Pourquoi cochez Run untagged jobs ?

Les runners GitLab peuvent être associés à des tags pour mieux 
organiser l'exécution des jobs.
Un job sans tags sera exécuté **uniquement** par un runner qui 
n’exige pas de tags.

:::

### Enregistrement d'un runner

Pour enregistrer le runner de votre machine hôte, il faut exécuter
la commande `register` du conteneur `gitlab-runner` : 

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

```sh
docker run --rm \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner register \
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
docker run --rm ^
-v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner gitlab/gitlab-runner register  ^
--non-interactive ^
--url "https://git.esi-bru.be" ^
--token "$RUNNER_TOKEN" 
--executor "docker" ^
--docker-image alpine:latest ^
--description "docker-runner"
```

  </TabItem>
</Tabs>

:::note Exercice A

Associez les descriptions ci-dessous aux différents paramètres de 
la commande précédente (`--non-interactive`, `--url "https://git.esi-bru.be"`, ... ) : 

- Fournit une description pour le runner, qui permet de l'identifier dans l'interface GitLab.
- Spécifie l'URL de votre instance GitLab. 
- Utilise le token d'enregistrement contenu dans la variable d'environnement $RUNNER_TOKEN.
- Indique que l'enregistrement du runner doit se faire sans interaction utilisateur, ce qui est **essentiel pour inclure la commande dans un script**.
- Spécifie l'image Docker à utiliser pour exécuter les jobs.
- Définit l'exécuteur, c'est à dire l'environnement d'exécution utilisé par le runner.

:::

Pour valider le succès de l'enregistrement, consultez la liste des runners de votre projet sur le serveur GitLab via le menu 
*Settings > CI/CD*.

## Premier script

### Hello World

Maintenant que le runner est configuré, créez 
**à la racine de votre projet** le fichier `.gitlab-ci.yml` 
suivant : 

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
```

Ce fichier définit un pipeline GitLab CI/CD avec un seul job nommé 
**my_first_job**.

| Élément          | Description |
|-----------------|-------------|
| `my_first_job:`  | Nom du job, qui apparaîtra dans l'interface GitLab CI/CD. |
| `script:`        | Indique la ou les commandes à exécuter dans le job. |
| `- echo "Hello World!"` | Commande exécutée dans l'environnement du runner. Elle affiche simplement `Hello World!` dans la console. |


Déposez ce fichier sur le dépôt, via les étapes `git add .`,
`git commit -m "Premier pipeline"` et `git push`. 
Lorsqu'un commit est poussé dans le dépôt, GitLab CI/CD détecte le 
fichier `.gitlab-ci.yml`. Il crée un pipeline et exécute le job 
`my_first_job`. Le runner associé exécute le script qui affiche le
message dans les logs. Le job se termine avec le statut *Success*, 
sauf en cas d'erreur.

Pour vérifier l'exécution du job, consultez sur la page de votre 
projet sur le serveur GitLab, le menu **Build > Jobs**.
Cliquez ensuite sur le nom du job, par exemple 
`#7562: my_first_job`,  afin de lire les logs de l'exécution. 
Cherchez dans ces logs le résultat de l'instruction 
`echo "Hello World!"`.

### Variables du projet

Vous pouvez déclarer une variable dans le fichier `.gitlab-ci.yml`
via le mot clé `variables` :

```yaml title="gitlab-ci.yml" showLineNumbers
variables:
  FIRST_VARIABLE: "Test"

deploy_job:
  script:
    - echo "Hello World!"
    - echo "Contenu de la variable FIRST_VARIABLE $FIRST_VARIABLE"    
```

Vous pouvez également définir une variable via l’interface GitLab.
Dans le menu **Settings > CI/CD/ Variables**, il faut cliquer sur 
*Add Variable* et remplir les champs :

- Type : Variable d’environnement ou fichier.
- Environments : Appliquer à tous les environnements ou un spécifique. Les environnements peuvent être définis via le mot clé
`environment` dans le script.
- Options :
  - Protected : Utilisable uniquement sur [les branches protégées](https://git.esi-bru.be/help/user/project/protected_branches.md).
  - Masked : Cachée dans les logs CI/CD.
- Key : nom de la variable, par exemple MY_VARIABLE
- Value : Valeur de la variable.

Lorsqu’une variable est de type *Fichier*, sa valeur est stockée 
dans un fichier temporaire sur le runner pendant l’exécution du 
job. Cette option est utile pour stocker des certificats ou des 
clés privées

Le champ *Masked* permet de cacher la valeur de la variable 
lorsqu’elle apparaît dans les logs des jobs ou dans l’interface. 
**Cette option est particulièrement utile pour protéger des informations sensibles** (comme des mots de passe, des clés API ou 
des tokens).

:::note Exercice B

Créez la variable MY_VARIABLE avec la valeur 42
via l’interface GitLab. Vérifiez la création de la
variable via une mise à jour du fichier *gitlab-ci.yml*.

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
    - echo "La valeur de MY_VARIABLE est '$MY_VARIABLE'"
```

:::

:::tip mise à jour du pipeline

Pour mettre à jour le fichier *gitlab-ci.yml* directement
via l'interface GitLab, ouvrez le menu **Build > Pipeline editor**
de votre projet. Une fois vos modifications rédigées, appuyez
sur le bouton **Commit changes**.

:::

### Condition

Pour ajouter une condition sur une variable vous pouvez
utiliser le bloc conditionnel de votre shell.
Par exemple, le script peut ressembler à : 

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
    - |
      if [ "$MY_VARIABLE" -eq 42 ]; then
        echo "La variable MY_VARIABLE vaut 42 comme attendu"
      else
        echo "Attention la variable MY_VARIABLE n'a pas la valeur prévue $MY_VARIABLE"
      fi    
```

:::tip Block Style Indicator

En YAML le *Block Style Indicator* est un mécanisme qui permet de 
spécifier un bloc de texte multiligne de manière plus lisible et 
structurée. L'indicateur **|** est utilisé pour indiquer que vous 
avez un texte multiligne. Les retours à la ligne et les 
indentations seront préservés dans le fichier YAML.

:::

### Variables prédéfinies

Plusieurs variables sont prédéfinies pour le runner.
On trouve par exemple CI_COMMIT_AUTHOR contenant l'auteur du commit
ou encore CI_COMMIT_BRANCH contenant la branche sur laquelle le commit a été effectué.
Vous pouvez consulter la [liste des variables prédéfinies](https://docs.gitlab.com/ci/variables/predefined_variables/).

:::note Exercice C

Modifiez votre pipeline pour afficher les informations suivantes :
- Url du Projet
- Auteur du commit
- Branche de commit

Vérifiez le résultat de l'exécution de votre pipeline.

:::


### Execution failed

Dans cet section vous allez créer un pipeline qui est obligé de se
terminer en échec afin réaliser comment GitLab vous informe d'un échec.

:::note Exercice D

Modifiez votre pipeline en demandant au job d'afficher la
version de maven utilisable dans le runner.

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - mvn --version
```

Maven n'étant pas installer dans l'image de votre runner, vérifiez 
que le statut de votre job est **failed** via le menu **Build > Jobs**

Cherchez dans les logs la cause de l'erreur.

:::

### Before et after script

Si vous souhaitez exécutez une action avant ou après l'exécution 
des instructions contenues dans la partie script d'un job, vous 
pouvez ajouter les sections `before_script` et `after_script`.
Afin de corriger votre pipeline, il faut installer maven
dans votre runner. Pour ce faire vous pouvez utiliser 
la directive `before_script` dans le job : 

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  before_script:
    - echo "Installation des dépendances..."
    - apk update
    - apk add curl
    - echo "Dépendances installées. Début du job..."
  script:
    - echo "Exécution du job"
  after_script:
    - echo "Nettoyage des fichiers temporaires (si nécessaire)..."
    - echo "Fin du job."
```

:::note Exercice D

Modifiez votre pipeline pour installer maven dans votre runner
avant le début job.

:::

### Default et image

Dans un fichier .gitlab-ci.yml, la directive `image:` est utilisée 
pour spécifier l'image Docker que GitLab CI/CD doit utiliser pour 
**exécuter le job**. 
Cette image définit l'environnement dans lequel les commandes du 
job seront exécutées. Cela permet de personnaliser l'environnement 
d'exécution et de s'assurer que les outils ou dépendances 
nécessaires sont disponibles.

Par exemple vous pouvez utiliser une image spécifique
pour un job nécessitant maven.

```yaml title="gitlab-ci.yml" showLineNumbers
my_first_job:
  image: maven:3.9.9-eclipse-temurin-23-alpine
  script:
    - mvn --version
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

:::note Exercice D

Exercice : Utilisation des stages dans GitLab CI/CD
Objectif :

Créer un pipeline GitLab CI/CD structuré en plusieurs étapes (stages) pour :

    prepare : Installer les dépendances nécessaires.
    test : Vérifier l'état d'un site web.
    deploy : Simuler un déploiement si le test est réussi.

Instructions :

    Créez un fichier .gitlab-ci.yml dans votre dépôt.
    Définissez trois stages : prepare, test et deploy.
    Ajoutez les jobs correspondants.
    Vérifiez que le job deploy s'exécute uniquement si le job test réussit.

:::

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

:::note Exercice E

Exercice : Utilisation du cache avec Python dans GitLab CI/CD
Objectif :

Optimiser un pipeline GitLab CI/CD en mettant en cache les dépendances Python installées avec pip, afin d'accélérer les exécutions suivantes.
Scénario :

Vous travaillez sur un projet Python et vous voulez :

    Installer les dépendances avec pip install tout en les mettant en cache.
    Exécuter un test simple pour vérifier le bon fonctionnement du script.

Instructions :

    Créez un fichier .gitlab-ci.yml dans votre dépôt.
    Ajoutez un job qui installe les dépendances Python avec mise en cache.
    Ajoutez un second job qui exécute un test simple.
    Vérifiez que le cache est bien utilisé après la première exécution du pipeline.

:::


### Exécution conditionnée

```yaml title="gitlab-ci.yml" showLineNumbers
job_build:
  script:
    - mvn package -DskipTests
  only:
    - main
    - develop
```

:::note Exercice F

Exercice : Utilisation de only dans GitLab CI/CD
Objectif :

Créer un pipeline GitLab CI/CD où :

    Certains jobs ne s'exécutent que sur la branche main.
    D'autres jobs s'exécutent uniquement sur des branches de feature (feature/*).

Scénario :

Vous développez une application et vous voulez :

    Exécuter des tests sur toutes les branches (run_tests).
    Déployer uniquement depuis main (deploy).
    Analyser la qualité du code uniquement sur les branches feature/* (code_quality).

Instructions :

    Créez un fichier .gitlab-ci.yml dans votre dépôt.
    Ajoutez trois jobs : run_tests, deploy, code_quality.
    Utilisez only pour restreindre leur exécution.
    Poussez des commits sur main et une branche feature/test pour observer la différence.

:::

### Workflow

```yaml title="gitlab-ci.yml" showLineNumbers

```

:::note Exercice F

Exercice : Contrôle du workflow avec workflow: dans GitLab CI/CD
Objectif :

Utiliser workflow: pour empêcher l'exécution du pipeline dans certaines conditions et l'autoriser dans d'autres.
Scénario :

Vous travaillez sur un projet où :

    Le pipeline ne doit s'exécuter que si un fichier spécifique (src/) a été modifié.
    Le pipeline ne doit PAS s'exécuter si le commit contient [skip ci] dans le message.

Instructions :

    Créez un fichier .gitlab-ci.yml dans votre dépôt.
    Ajoutez une règle workflow: rules pour contrôler l’exécution du pipeline.
    Ajoutez un job simple (run_tests) pour vérifier si le pipeline démarre correctement.
    Testez en poussant différentes modifications :
        Modifiez un fichier dans src/ → Le pipeline doit s’exécuter ✅
        Modifiez un fichier hors src/ (ex: README.md) → Le pipeline NE DOIT PAS s’exécuter ❌
        Ajoutez [skip ci] dans le message du commit → Le pipeline NE DOIT PAS s’exécuter ❌

:::


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