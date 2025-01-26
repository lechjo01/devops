# TD 03 - Configurer une DB

Ce TD vous guidera à travers les étapes nécessaires pour développer, 
configurer, et déployer une application Spring Boot connectée à une 
base de données sur la plateforme Alwaysdata.

## Objectifs du TD

À l'issue de ce TD, vous serez capable de :

1. Créer une base de données sur AlwaysData.
1. Configurer la connexion à la base de données à l’aide de variables d’environnement pour garantir la sécurité et la flexibilité.
1. Déployer l’application Spring Boot sur AlwaysData et la lier à une base de données en ligne.
1. Rédiger un script shell permettant d’automatiser le processus complet de déploiement.

:::warning Pré-requis

1. Connaissances de base en Spring Boot, en gestion de bases de données relationnelles et en script shell.
1. Environnement de travail configuré avec Java, Git et un IDE de votre choix.
1. Un compte Alwaysdata associé à votre machine via une clé SSH.

:::

# Un service rest avec une base de données

Commencez par récupérer l'application Spring-Boot à déployer.

```
git clone https://git.esi-bru.be/4dop1dr-ressources/demo.git
```

Cette application est composée du controlleur suivant : 

```java showLineNumbers
@RestController
public class ServiceRestController {
    
    @Autowired
    private PersonDB repository;

    @Autowired
    private Environment environment;

    @GetMapping("/config")
    public Map<String, String> getEnvironmentDetails() {
        Map<String, String> envDetails = new HashMap<>();
        
        // Récupération des propriétés de configuration Spring Boot
        // depuis application.properties
        envDetails.put("Application Name", environment.getProperty("spring.application.name"));
        envDetails.put("Port Number", environment.getProperty("server.port"));

        // Récupération des propriétés système
        envDetails.put("Java Version", System.getProperty("java.version"));
        envDetails.put("Operating System", System.getProperty("os.name"));
        envDetails.put("User Name", System.getProperty("user.name"));
        
        //Récupération des données de la Personne d'identifiant 1
        Person person = repository.findById(1).get();
        // Ajouter les valeurs provenant de la base de données
        envDetails.put("Person ", person.toString());

        return envDetails;
    }
    
}
```

Le contrôleur de l'application Spring expose un service REST qui retourne en plus des détails sur la configuration de l'environnement dans lequel l'application s'exécute, des données relatives à une personne persistées dans une base de données. 

Lors du démarrage du serveur Tomcat, un serveur de bases de données embarqués de type H2 est démarré. Le fichier `application.properties` contient les paramètres de connexion vers cette base de données

```java title="application.properties"
spring.application.name=demo pour devops
server.port=8080

#Configuration de la base de données embarquée
spring.datasource.url=jdbc:h2:mem:mydatabase
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.defer-datasource-initialization=true
```

:::note Exercice

1. Empaquetez et démarrez l'application.
1. Connectez vous à la console de la base de données 
via [localhost:8080/h2-console](localhost:8080/h2-console)
1. Entrez `sa` comme nom d'utilisateur
1. N'entrez aucun mot de passe.
1. Vérifiez que la table Person a été créée.

Pensez-vous que cette configuration sans mot de passe 
est correcte pour déployer l'application ?

:::

## Préparer l’infrastructure

Lorsque vous déployez votre application sur Alwaysdata, 
le serveur de base de données H2 embarqué ne sera pas initialisé. 
Ce comportement de Alwaysdata empêche la création d’un processus 
dédié à la gestion des données en mémoire.
C’est en réalité une bonne chose : avec une base de données embarquée, 
les données sont stockées dans la mémoire vive de l’application et **disparaissent** 
à chaque arrêt ou redémarrage. Ainsi, sur Alwaysdata, toute interruption 
de l’application entraînerait la perte des données, car H2 ne permet 
pas leur persistance.
Une meilleure pratique consiste à créer une base de données directement 
sur Alwaysdata via leur interface, puis à configurer votre application 
pour utiliser cette base externe à la place de H2.

### Créer la base de données 

Dans le menu de votre compte Alwaysdata, allez dans le menu `Databases > MySQL`.  
Appuyez sur `Add a database` et intitulez cette base de données `g12345_demo_devops`. 
N'oubliez pas de sélectionner les permissions adéquate pour votre utilisateur,
c'est à dire `all rights`.

Sur la page listant vos bases de données MySQL, vous trouverez l'information 
`MySQL host: mysql-g12345.alwaysdata.net`, qui vous permettra de configurer 
les paramètres de connexion pour votre application déployée.
Cette même page fournit un lien vers la console phpMyAdmin 
: [https://phpmyadmin.alwaysdata.com/](https://phpmyadmin.alwaysdata.com/).

:::note Exercice

Connectez-vous à la console phpMyAdmin  en utilisant votre nom d’utilisateur (`g12345`) 
et le mot de passe de votre compte AlwaysData, puis vérifiez 
que la base de données `g12345_demo_devops` est **vide**.

:::

## Les variables d'environnements

### Sur la machine locale

Sur votre machine, modifiez le fichier `application.properties` 
et supprimez les informations concernant H2.

```java title="application.properties" showLineNumbers
spring.application.name=demo pour devops
server.port=8080

#Configuration de la base de données embarquée
spring.jpa.defer-datasource-initialization=true
```

Empaquetez votre application et démarrez la en ajoutant 
les variables d'environnements systèmes comme ci-dessous : 

```
export SPRING_DATASOURCE_URL=jdbc:h2:mem:mydatabase
export SPRING_DATASOURCE_USERNAME=sa
export SPRING_DATASOURCE_PASSWORD= 
```

Consommez le service REST afin de **vérifiez** que 
l'application fonctionne suite à ce changement.

### Sur la machine distante 

Connectez-vous à votre compte Alwaysdata et consultez la page des sites. 
Modifiez les propriétés de votre site (&#9881;&#65039;) et 
ajoutez dans la section `Environment` les variables d'environnements systèmes :

```
export SPRING_DATASOURCE_URL=jdbc:mysql://mysql-jlc.alwaysdata.net:3306/jlc_demo_devops
export SPRING_DATASOURCE_USERNAME=g12345
export SPRING_DATASOURCE_PASSWORD=le mot de passe de votre compte Alwaysdata
```

Finalement : 

1. Enregistrez vos modifications.
1. Copiez le fichier JAR de votre application.
via la commande `scp` dans le dossier `www`.
1. Consommez le service via l'url `http://g12345.alwaysdata.net/`.
1. Connectez-vous à la console phpMyAdmin : https://phpmyadmin.alwaysdata.com/.
1. Vérifiez que la table `Person` est créée.

:::danger Mot de passe visible

Votre mot de passe est affiché en clair et reste visible dès 
que la page des paramètres de votre site est ouverte. 
Dans les prochains TD, nous introduirons le concept de variables 
secrètes pour remédier à ce problème.

:::

## La logique DevOps : l'automatisation

:::note Exercice

Afin de prendre conscience de l'avantage d'automatiser des processus répétitif 
et de se placer dans une logique DevOps professionnelle écrivez un script shell qui

1. Compile l’application Spring Boot : `mvn compile`.
1. Lance les tests unitaires de l'application : `mvn test`.
1. Empaquete l’application  : `mvn package`.
1. Déploie l'application sur Alwaysdata à l'aide de la commande `scp`.

Le script doit vérifier après chaque action le succès ou l'échec de cette action et arrêter le script en indiquant à l'utilisateur la cause d'arrêt en cas d'erreur.

pensez à modifier la variable `spring.application.name` à chaque déploiement 
pour confirmer que la mise à jour a bien été prise en compte. 
Par exemple, vous pouvez utiliser une valeur unique basée sur le numéro de l'essai :

```
spring.application.name=demo pour devops - déploiement numéro 42
```

Cela permet de vérifier facilement que l'application déployée correspond 
à la version la plus récente.

Vous pouvez également dans le menu du site de Alwaysdata 
appuyer sur le bouton affichant les `logs` de votre application
pour consulter les messages d'erreurs.

A titre d'exemple voici un script shell automatisant l'étape d'empaquetage 
de notre application. 
Remarquez l'utilisation de la condition `if [ $? -ne 0 ]` permettant de détecter 
si la commande précédente s'est terminée en erreur ou en succès. 

``` bash showLineNumbers
#!/bin/bash

# Chemin vers votre projet à compléter
WORK_DIR="/home/..."

cd "$WORK_DIR"

echo "  Création du fichier JAR..."
./mvnw package
# highlight-start
if [ $? -ne 0 ]; then
    echo "  Erreur : Échec de la création du fichier JAR."
    exit 1
fi
# highlight-end
echo "  Fichier JAR créé : $JAR_FILE."

```

:::