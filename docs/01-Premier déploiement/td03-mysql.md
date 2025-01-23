# TD 03 - Gestion d'une DB

Ce TD vous guidera à travers les étapes nécessaires pour développer, configurer, et déployer une application Spring Boot connectée à une base de données sur la plateforme AlwaysData.

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
git clone https://git.esi-bru.be/jlechien/spring-demo.git
```

Cette application est composée du controlleur suivant : 

```java 
@RestController
public class ServiceRestController {
    
    @Autowired
    private PersonDB repository;

    @Autowired
    private Environment environment;

    @GetMapping("/config")
    public Map<String, String> getEnvironmentDetails() {
        Map<String, String> envDetails = new HashMap<>();
        
        // Ajouter les propriétés dans la réponse
        envDetails.put("Application Name", environment.getProperty("spring.application.name"));
        envDetails.put("Port Number", environment.getProperty("server.port"));

        // Ajouter les variables système
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

Empaquetez et démarrez l'application.
Connectez vous à la console de la base de données via localhost:8080/h2-console

Entrez `sa` comme nom d'utilisateur et n'entrez aucun mot de passe. Vérifiez que la table Person a été créée.

:::warning

Pensez-vous que cette configuration est correcte pour déployer l'application ?

:::

## Préparer l’infrastructure

Lorsque vous déploierez votre application sur Alwaysdata, le serveur de base de données H2 embarqué ne sera pas créé. Il s'agit d'un dispositif qui empêche votre déploiement de créer un processus dédié à la gestion de données en mémoire.

C'est une bonne nouvelle. Avec la bse de données embarquée les données sont stockées dans la mémoire vive de l'application et disparaissent dès que l'application est arrêtée ou redémarrée.
Lors du déploiement sur AlwaysData, chaque redémarrage ou arrêt de l'application entraîne la perte de **toutes** les données H2, car elles ne sont pas persistées. 

la bonne pratique est de créer une base de données sur AlwaysData (via leur interface) et de configurer votre application pour utiliser cette base de données à la place de H2.

Dans le menu de votre compte Alwaysdata, allez dans le menu `Databases > MySQL`.  Appuyez sur `Add a database` et intitulez cette base de données `g12345_demo_devops`. N'oubliez pas de sélectionner les permissions adéquate pour votre utilisateur (`all rights`).

Sur la page de la liste des bases de données MySQL est indiqué `MySQL host: mysql-g12345.alwaysdata.net` qui vous renseigne sur les paramètres à donner à votre application une fois déployée.

```
spring.datasource.url=jdbc:mysql://mysql-g12345.alwaysdata.net:3306/g12345_demo_devops
```

Toujours sur la page de la liste des base de données MySQL est indiqué un lien vers la console phpMyAdmin : https://phpmyadmin.alwaysdata.com/

Entrez votre nom d'utilisateur (g12345) et le mot de passe de votre compte Alwaysdata pour vérifier que la base de données `g12345_demo_devops` est vide.

## Les variables d'environnements

Modifiez le fichier `application.properties` et supprimez les informations concernant H2.

```java title="application.properties"
spring.application.name=demo pour devops
server.port=8080

#Configuration de la base de données embarquée
spring.jpa.defer-datasource-initialization=true
```

Empaquetez votre application et démarrez votre application là en ajoutant les variables systèmes comme ci-dessous : 

```
export SPRING_DATASOURCE_URL=jdbc:h2:mem:mydatabase
export SPRING_DATASOURCE_USERNAME=sa
export SPRING_DATASOURCE_PASSWORD=
java -jar demo-1.0.0.jar 
```

Consommez le service rest afin de vérifiez que l'application fonctionne toujours.

Connectez-vous à votre compte Alwaysdata et consultez la page des sites. Modifiez les propriétés de votre site et ajoutez dans la section `Environment` les variables

```
export SPRING_DATASOURCE_URL=jdbc:mysql://mysql-jlc.alwaysdata.net:3306/jlc_demo_devops
export SPRING_DATASOURCE_USERNAME=g12345
export SPRING_DATASOURCE_PASSWORD=le mot de passe de votre compte Alwaysdata
```

:::danger Mot de passe visible

Votre mot de passe est écrit explicitement et est visible dès que la page des paramètres de votre site est ouverte. Dans les TDs futurs nous utiliserons une notion de variable secrète qui résous ce problème.

:::

Enregistrer vos modifications.

Copier le fichier JAR de votre application via la commande `scp` et testez le service via l'url `http://g12345.alwaysdata.net/`

Connectez-vous à la console phpMyAdmin : https://phpmyadmin.alwaysdata.com/ et vérifiez que la table `Person` est créée.

## La logique DevOps : automatisation

Une bonne pratique DevOps est d'automatiser les opérations répétitives. A titre d'exemple voici un script shell automatisant l'étape d'empaquetage de notre application. Remarquez l'utilisation de la condition `if [ $? -ne 0 ]` permettant de détecter si la commande précédente s'est terminée en erreur ou en succès. 

``` bash showLineNumbers
#!/bin/bash

# Chemin vers votre projet à compléter
PROJECT_DIR="/home/..."

cd "$PROJECT_DIR"

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

Afin de prendre conscience de l'avantage d'automatiser des processus répétitif et de se placer dans une logique DevOps professionnelle réalisez le script décrit dans l'exercice suivant.

:::note Exercice

Créez un script shell qui : 

1. Compile l’application spring-boot : `mvn compile`
1. Lance les tests unitaires de l'application : `mvn test`
1. Empaquete l’application  : `mvn package`
1. Déploie l'application sur Alwaysdata : `scp ...`

Le script doit vérifier après chaque action le succès ou l'échec de cette action et arrêter le script en indiquant à l'utilisateur la cause d'arrêt en cas d'erreur.

Pensez à modifier la variable `spring.application.name` à chaque déploiement afin de vérifier que la mise à jour est un succès. Par exemple avec une valeur dépendant du numéro de l'essai que vous réalisez `spring.application.name=demo pour devops déploiement numéro 42`.

Vous pouvez également dans le menu du site de Alwaysdata appuyer sur le bouton affichant les `logs` de votre application.

:::