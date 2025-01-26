import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 02 - Livrer une application

Ce TD est consacré au déploiement d’une application Spring Boot sur un serveur distant. 

### Objectifs 

À l’issue de ce TD, vous serez capable de :

1. Créer un compte AlwaysData et de configurer un environnement d’hébergement.
1. Générer une clé SSH pour sécuriser les échanges avec AlwaysData.
1. Déployer une application Spring Boot sur AlwaysData.

:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum) et un IDE (VS Codium).

:::

## Préparer l’infrastructure

AlwaysData est une plateforme qui permet d'héberger des sites web, des applications et des bases de données en ligne. 
Elle prend en charge de nombreuses technologies telles que PHP, Python, Node.js, Ruby et Java. Elle est compatible avec des systèmes de bases de données comme MySQL, PostgreSQL, SQLite et MongoDB. 
De plus, elle offre un accès SSH pour une gestion avancée.
Pour déployer une application Spring Boot sur cette plateforme,
[commencez par vous inscrire sur Alwaysdata en utilisant votre adresse mail étudiant.](https://www.alwaysdata.com/fr/inscription/)

### Installer le JDK

Une fois connecté, la page d’accueil affiche les **Sites** associés à votre compte. 
Un premier site est créé et à la forme *g12345.alwaysdata.net*. 

:::warning

Par défaut la machine qui héberge votre site ne dispose pas d'une version du JDK installée.
[Consultez la documentation de Alwaysdata avant de passer à la suite afin de comprendre les étapes suivantes.](https://help.alwaysdata.com/en/languages/java/configuration/)

:::

Appuyez sur le bouton permettant de modifier le site &#9881;&#65039;
- Changez le *Type* en *User program*.
- Ajoutez dans le champs *Command* `java -jar demo-1.0.0.jar --server.address=:: --server.port=$PORT`.
- Dans le champs *Working directory* ajoutez `www`, qui est le dossier de travail
prévu pour votre application. 

### Activer SSH

:::info
SSH (Secure Shell) est un protocole réseau sécurisé qui permet d'établir une connexion à distance entre deux machines, généralement un ordinateur local et un serveur. Il offre une communication chiffrée pour garantir la confidentialité et la sécurité des échanges.
:::

Pour pouvoir déposer le fichier JAR de l'application, il faut définir le protocole de communication entre la machine de développement et la machine hébergée chez Alwaydata. Les deux machines vont communiquer via SSH.

1. Sur la page de votre compte, sélectionnez le menu `Remote access > SSH` dans le menu de navigation. 
Cette page liste les utilisateurs SSH associés à votre compte. Un utilisateur par défaut a été créé lors de la création de votre compte mais cet utilisateur n'est pas utilisable. 
1. Cliquez sur le bouton pour modifier cet utilisateur &#9881;&#65039; et cochez la case `Enable password-based login `. Cette option va vous permettre de vous connecter à la machine réservée pour vous sur Alwaysdata en utilisant le mot de passe de votre compte.
1. **Vérifiez** que l'activation SSH fonctionne en ouvrant sur votre machine de travail un terminal et en exécutant la commande `ssh g12345@ssh-g12345.alwaysdata.net`
1. Confirmez cette première connexion en répond `yes` à la question `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
1. Entrez votre mot de passe quand il vous est demandé. 
1. Si la connexion est un succès, le prompt de votre terminal a changé pour `g12345@ssh2:~$` et vous pouvez consulter le contenu de la machine associée à votre compte via `ls -lrtd *`.
1. Vous devez voir deux dossier `admin` et `www`. Le dossier `www` est vide et va bientôt accueillir votre fichier JAR.
1. Entrez la commande `exit` pour vous déconnecter.

### Créer une clé SSH

Une pratique courante consiste à configurer une clé SSH.
Cette clé permet de se connecter automatiquement aux serveurs sans nécessiter de mot de passe à chaque connexion, offrant ainsi une solution pratique pour les utilisateurs réguliers.
De plus, les clés SSH sont indispensables pour automatiser des tâches avec des scripts ou des outils comme Git, garantissant une connexion sécurisée sans intervention humaine.

:::note Exercice

Créez une clé SSH sur votre machine en suivant [la marche à suivre via ce lien.](https://help.alwaysdata.com/en/remote-access/ssh/use-keys/)

**Vérifiez** la connexion via `ssh g12345@ssh-g12345.alwaysdata.net`
Si la connexion échoue, utilisez l'option `-v` (verbose) de la commande `ssh` pour obtenir des informations détaillées.
:::


## Déployer l'application

L’infrastructure en place, le déploiement se résume à copier l'application empaquetée dans le dossier d’accueil sur la machine hébergée en ligne en utilisant le protocole SSH. 

:::note Exercice

Utilisez la commande `scp` pour copier le fichier JAR dans le dossier `www`  et déployer l'application. 

Après le déploiement tester le résultat via la commande `wget` ou `curl` via l'url `http://g12345.alwaysdata.net/`

:::

