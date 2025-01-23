import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 02 - Alwaysdata

Ce TD est consacré au déploiement d’une application Spring Boot sur un serveur distant. 
Vous apprendrez à maîtriser les étapes essentielles pour déployer une application sur AlwaysData, une plateforme d’hébergement en ligne.

### Objectifs 

À l’issue de ce TD, vous serez capable de :

1. Créer un compte AlwaysData et configurer un environnement d’hébergement.
1. Générer une clé SSH pour sécuriser les échanges avec AlwaysData.
1. Déployer l’application Spring Boot sur AlwaysData.

:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum) et un IDE (VS Codium).

:::

## Préparer l’infrastructure

AlwaysData est une plateforme qui permet d'héberger des sites web, des applications et des bases de données en ligne. 
Elle prend en charge de nombreuses technologies telles que PHP, Python, Node.js, Ruby et Java. Elle est compatible avec des systèmes de bases de données comme MySQL, PostgreSQL, SQLite et MongoDB. 
De plus, elle offre un accès SSH pour une gestion avancée.
Vous allez déployer votre application sur cette plateforme.

[Commencez par vous inscrire sur Alwaysdata en utilisant votre adresse mail étudiant.](https://www.alwaysdata.com/fr/inscription/)

### Installer le JDK

Une fois connecté la page d’accueil liste les *Site* disponibles avec votre compte. Un premier site est créé et à la forme *nom_utilisateur.alwaysdata.net*. Par défaut la machine qui héberge votre site ne dispose pas d'une version du JDK installée.

[Consultez la documentation de Alwaysdata avant de passer à la suite afin de comprendre les étapes suivantes.](https://help.alwaysdata.com/en/languages/java/configuration/)

Appuyez sur le bouton permettant de modifier le site
- changez le *Type* en *User program*.
- ajoutez dans le champs *Command* `java -jar demo-1.0.0.jar --server.address=:: --server.port=$PORT`
- dans le champs *Working directory* ajoutez `www`. 

### Activer SSH

Pour pouvoir déposer le fichier JAR de l'application, il faut définir le protocole de communication entre la machine de développement et la machine hébergée chez Alwaydata. Les deux machines vont communiquer via SSH.

:::info
SSH (Secure Shell) est un protocole réseau sécurisé qui permet d'établir une connexion à distance entre deux machines, généralement un ordinateur local et un serveur. Il offre une communication chiffrée pour garantir la confidentialité et la sécurité des échanges.
:::

Sur la page de votre compte, sélectionnez le menu `Remote access > SSH` dans le menu de navigation. Cette page liste les utilisateurs SSH associés à votre compte. Un utilisateur par défaut a été créé lors de la création de votre compte mais cet utilisateur n'est pas utilisable. Cliquez sur le bouton pour modifier  cet utilisateur et cochez la cas `Enable password-based login `. Cette option va vous permettre de vous connecter à la machine réservée pour vous sur Alwaysdata en utilisant le mot de passe de votre compte.

Vérifiez que l'activation SSH fonctionne en ouvrant sur votre machine de travail un terminal et en exécutant la commande 

```
ssh g12345@ssh-g12345.alwaysdata.net
```

Comme il s'agit de votre première connexion, une confirmation va vous être demandée via la question suivante : 

```
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Répondez `yes` et entrez votre mot de passe quand il vous est demandé. Si la connexion est un succès, le prompt de votre terminal a changé pour `g12345@ssh2:~$` et vous pouvez consulter le contenu de la machine associée à votre compte.

```
g12345@ssh2:~$ ls -lrtd *
drwxr-xr-x 5 root    root    69 Jan 16 14:37 admin
drwxr-xr-x 2 g12345  g12345  28 Jan 16 20:28 www
```

Le dossier `www` est vide et c'est dans ce dossier que vous allez déposer le fichier JAR créé précédemment.

Entrez la commande `exit` pour vous déconnecter.

Une pratique courante est de définir une clé SSH.

Une fois configurée, la clé SSH permet de se connecter automatiquement aux serveurs sans avoir à entrer un mot de passe à chaque fois, ce qui est pratique pour les utilisateurs fréquents.

Les clés SSH sont essentielles pour automatiser des tâches via des scripts ou des outils comme Git, car elles permettent une connexion sécurisée sans intervention manuelle.

[Consultez la marche à suivre pour créer une telle clé.](https://help.alwaysdata.com/en/remote-access/ssh/use-keys/)

Vérifiez la connexion via 

```
ssh g12345@ssh-g12345.alwaysdata.net
```

Si la connexion échoue, utilisez l'option `-v` (verbose) pour obtenir des informations détaillées sur le processus de connexion :

```
ssh -v g12345@ssh-g12345.alwaysdata.net
```

## Déployer l'application

L’infrastructure en place, le déploiement se résume à copier l'application empaquetée dans le dossier d’accueil sur la machine hébergée en ligne en utilisant le protocole SSH. 

:::note Exercice

Copier le fichier JAR dans le dossier `www`  pour déployer l'application. 

Après le déploiement tester le résultat via la commande `wget` ou `curl` via l'url `http://g12345.alwaysdata.net/`

:::

:::tip La commande scp

scp est un outil basé sur SSH qui permet de transférer des fichiers entre des machines locales et distantes, ou entre deux machines distantes.
:::