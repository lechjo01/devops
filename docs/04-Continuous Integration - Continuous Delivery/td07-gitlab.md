# TD 07 - Gitlab CI/CD

![work in progress](/img/work-in-progress.jpeg)

Date de publication : 27 février 2025

<!--
## Gitlab runner

Un GitLab Runner est un outil qui exécute les tâches de vos pipelines CI/CD. Par défaut, GitLab fournit des runners partagés dans le cloud, mais vous pouvez configurer un runner personnalisé sur votre machine locale pour des besoins spécifiques, comme tester des pipelines en local.

Télécharger GitLab Runner

Rendez-vous sur la page officielle de téléchargement de GitLab Runner :
https://docs.gitlab.com/runner/install/

Sélectionnez votre système d’exploitation et suivez les instructions pour télécharger et installer le runner.


nregistrer le Runner avec GitLab

Une fois le GitLab Runner installé, vous devez l’enregistrer pour qu’il puisse être utilisé par vos pipelines.

Obtenir le jeton d’enregistrement :
- Allez sur l’interface web de votre projet GitLab.
- Accédez à Settings > CI/CD > Runners.
- Repérez la section Specific Runners.
- Copiez le jeton d’enregistrement.

Exécuter la commande d’enregistrement : Lancez cette commande pour enregistrer le runner

```
gitlab-runner register
```

Suivez les instructions :

- URL du serveur GitLab : Indiquez l’URL de votre instance GitLab (par ex., https://gitlab.com ou une URL auto-hébergée).
- Jeton : Collez le jeton copié précédemment.
- Description : Donnez un nom au runner (par ex., "Runner Local").
- Tags : Ajoutez des tags pour identifier ce runner (par ex., local, debug, etc.).
- Executor : Choisissez un type d’exécuteur (souvent shell pour un environnement local)

Le runner est maintenant enregistré !

## Création d’un fichier .gitlab-ci.yml

```
stages:
  - build

build_job:
  stage: build
  script:
    - ./gradlew clean build
```

Explication : Cette configuration exécute la commande ./gradlew clean build pour compiler le projet et générer un fichier .jar.

Déclencher le pipeline.

Faire un commit et vérifier que le pipeline est déclenché automatiquement.    

Ajout de tests automatisés

Étendre le pipeline pour exécuter les tests :

```
stages:
  - test

test_job:
  stage: test
  script:
    - ./gradlew test
```

Résultat attendu : Les tests s’exécutent automatiquement, et leurs résultats apparaissent dans les logs du pipeline.

## Variables et environnementsVariables et environnements

Objectif : Gérer les secrets et les environnements.

Étape 1 : Ajouter des variables d’environnement dans GitLab :
Aller dans "Settings > CI/CD > Variables".
Ajouter des clés telles que DATABASE_URL, SPRING_PROFILES_ACTIVE, etc.

Étape 2 : Modifier le fichier .gitlab-ci.yml pour utiliser ces variables :

```
deploy_job:
  stage: deploy
  script:
    - java -jar -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE build/libs/*.jar
```

Étape 3 : Gérer plusieurs environnements (staging, production).
Ajouter des règles conditionnelles 

```
deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging"
  environment:
    name: staging

deploy_production:
  stage: deploy
  when: manual
  script:
    - echo "Deploying to production"
  environment:
    name: production
```

## Construction et déploiement sur Alwaysdata

```
stages:
  - build

build_job:
  stage: build
  script:
    - ./gradlew clean build
  artifacts:
    paths:
      - build/libs/*.jar

stages:
  - deploy

deploy_job:
  stage: deploy
  script:
    - scp build/libs/*.jar user@server:/path/to/deploy

```

## Pipeline avancé : stratégie conditionnelle

Objectif : Contrôler les pipelines avec des règles conditionnelles.

Étape 1 : Déclencher des builds uniquement sur des branches spécifiques.

```
build_job:
  stage: build
  script:
    - ./gradlew build
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

Étape 2 : Ajouter des déclencheurs manuels pour le déploiement.

```
deploy_production:
  stage: deploy
  when: manual
  script:
    - echo "Deploying to production"
```

## Intégration Docker

Objectif : Construire et déployer une image Docker de l’application.

Étape 1 : Ajouter un Dockerfile au projet :

```
FROM openjdk:17
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

Étape 2 : Configurer le pipeline pour construire une image Docker :

```
stages:
  - build
  - deploy

build_docker:
  stage: build
  script:
    - docker build -t my-spring-boot-app .
  artifacts:
    paths:
      - build/libs/*.jar
```

Étape 3 : Déployer l’image Docker sur un registre GitLab :

```
deploy_docker:
  stage: deploy
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $CI_REGISTRY_IMAGE
```

## Optimisation

Utiliser la mise en cache pour accélérer les builds :

```
cache:
  paths:
    - .gradle/
```

-->