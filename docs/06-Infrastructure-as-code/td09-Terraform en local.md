# TD 09 - Terraform

Terraform est un outil d’Infrastructure as Code (IaC) développé par HashiCorp. 
Il permet d’automatiser la création, la gestion et la mise à jour d’infrastructures.

### Objectifs 

À l’issue de ce TD, vous serez capable de créer une infrastructure sur Microsoft Azure
en utilisant un script Terraform.

:::warning Pré-requis

1. Connaissance de base en des commandes shell et du déploiement sur Microsoft Azure.
1. Un environnement de travail prêt avec Docker Engine.

:::

## Installation

Pour installer Terraform vous pouvez suivre les étapes suivantes : 

1. Télécharger le binaire Terraform [en consultant la page officielle](https://developer.hashicorp.com/terraform/install)
1. Extraire et placer le binaire dans un dossier accessible
1. Ajouter ce dossier à la variable d’environnement `PATH` 

Vérifiez l'installation de Terraform en exécutant la commande `terraform version`

## Script Terraform

Un script Terraform est un fichier écrit en HCL 
([HashiCorp Configuration Language](https://developer.hashicorp.com/terraform/language/syntax/configuration)) 
qui décrit l’infrastructure qu’on souhaite créer, modifier ou supprimer de manière **déclarative**.
Un script Terraform est généralement nommés `main.tf` et est décomposé en **Block**.

:::info block

Un Block est une structure de configuration qui regroupe des paramètres 
et des valeurs associés à une ressource, un module ou une configuration. 
Il est défini par un type et peut-être associé à des libellés. Un Block
contient un ou plusieurs arguments et éventuellement des blocs imbriqués.

Un block suit généralement cette syntaxe :

```sh 
bloc_type "nom" "nom_optionnel" {
  clé = valeur
  clé2 = valeur2

  bloc_imbriqué {
    clé = valeur
  }
}
```
:::

Le premier
Block que vous allez rencontrer est le bloc `terraform {}`.

```sh title="main.tf"
terraform {
  required_version = ">= 1.11.0"
}
```

Ce bloc est utilisé pour configurer Terraform. 
Il permet de spécifier des informations liées à l’environnement Terraform global. Dans l'exemple proposé il spécifie la version
minimale de Terraform pour exécuter ce script.

Vous pouvez consulter 
[la documentation du bloc terraform](https://developer.hashicorp.com/terraform/language/terraform)
pour connaitre les arguments autorisés.

En général un script Terraform est composé des types de blocks suivants : 

- `provider` : Définit la connexion à un service (Azure, Docker, AWS…).
- `variable` : Rend le code plus dynamique et réutilisable.
- `ressource` : Définit ce qui doit être créé (VM, conteneurs, bases de données,…).
- `output` : Affiche des informations utiles après l'exécution, comme les adresses IP des serveurs créés.

Si le script Terraform devient trop long, il peut être 
divisé en plusieurs fichiers (`variables.tf`, `outputs.tf`,…).

### Block de type provider

Un **provider** dans Terraform est un plugin qui permet d’interagir avec une 
plateforme. Il agit comme un connecteur entre Terraform 
et l’infrastructure à gérer. La liste des providers est disponible sur le
[registre Terraform](https://registry.terraform.io/browse/providers).

Dans un premier temps, vous allez utiliser le **provider local** pour apprendre 
les commandes Terraform essentielles avant de passer à la gestion 
d'infrastructure dans le cloud. 
Comme son nom l'indique, ce provider permet de créer et de manipuler des ressources sur votre 
machine locale, ce qui est idéal pour se familiariser avec Terraform sans nécessiter 
de connexion à un cloud comme Azure.

Dans un nouveau dossier créez le fichier `main.tf` suivant : 

```sh title="main.tf"
terraform {
  // highlight-next-line
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  // highlight-next-line  
  }
}

provider "local" {
  # Configuration options
}
```

Le bloc `terraform{}` est enrichi du sous block de type `required_providers`
Ce sous-bloc indique les providers 
nécessaires pour ce projet. [La configuration de ce block est
consultable en ligne](https://developer.hashicorp.com/terraform/language/providers/requirements). En résumé : 

- `local` : Le nom du provider
- `source` : Spécifie la source du provider, ici hashicorp/local, 
indiquant que le provider vient du registre officiel de HashiCorp.
- `version` : Spécifie la version du provider.

Un nouveau block de type provider est ajouté : `provider "local" {}`.
Ce block permet de configurer le provider.
Dans ce premier exemple aucune configuration n'est requise.

Le code exemple pour utiliser ce provider provient directement de
l'onglet *How to use this provider* du 
[registre terraform](https://registry.terraform.io/providers/hashicorp/local/latest)

Afin de télécharger le provider, exécutez la commande suivante : 

```sh
terraform init
```

Vérifiez qu'un dossier `.terraform` est créé dans votre dossier
de travail. Ce dossier contient le provider local.

:::info dependency-lock

Le fichier *.terraform.lock.hcl* 
[depedency-lock](https://developer.hashicorp.com/terraform/language/files/dependency-lock#lock-file-location)
créé après la commande `terraform init` verrouille les versions précises 
des providers utilisés dans le projet Terraform. 
Ainsi, même si une nouvelle version d’un provider est publiée, Terraform 
utilisera toujours la même version que celle enregistrée dans ce fichier, 
garantissant la stabilité du projet.

Si vous souhaitez forcer une mise à jour la commande `terraform init -upgrade` devra être utilisée.

:::

### Block de type resource

```sh title="main.tf"
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

provider "local" {}

// highlight-start 
resource "local_file" "example" {
  content  = "Hello, Terraform!"
  filename = "${path.module}/example.txt"
}
// highlight-end
```

`resource "local_file" "example" {}`
Le bloc de type resource est utilisé pour définir une ressource,
c'est à dire un élément que Terraform va créer, modifier ou supprimer.

Comme le détail [la documentation de ce block](https://developer.hashicorp.com/terraform/language/resources/syntax)
une ressource est définien via un type, `local_file` dans notre exemple.
Ensuite le nom `example` est associé à cette ressource afin de pouvoir
y faire référence dans le script.

Ce block est composé de deux arguements de confguration : 

- `content` : définit le contenu du fichier. 
- `filename` : définit le chemin du fichier créé. 
Le chemin est spécifié ici par `path.module`, qui fait référence au 
répertoire où se trouve le fichier `.tf` actuel, suivi du nom du fichier example.txt. 

L'utilisation de cette ressource est expliquée dans 
[la documentation du provider local](https://registry.terraform.io/providers/hashicorp/local/latest/docs/resources/file).

Afin de connaitre les actions que Terraform va entrepredre si vous
exécutez ce script, exécutez la commande : 

```sh
terraform plan
```

Le résultat de la commande doit vous indiquer les propriétés du
fichier `example.txt` qui va être créé.

```sh
Terraform will perform the following actions:

  # local_file.example will be created
  + resource "local_file" "example" {
      + content              = "Hello, Terraform!"
      + content_base64sha256 = (known after apply)
      + content_base64sha512 = (known after apply)
      + content_md5          = (known after apply)
      + content_sha1         = (known after apply)
      + content_sha256       = (known after apply)
      + content_sha512       = (known after apply)
      + directory_permission = "0777"
      + file_permission      = "0777"
      + filename             = "./example.txt"
      + id                   = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

Pour appliquer les modifications de l'infrastructre proposée,
utilisez la commande : 

```sh
terraform apply
```

:::info Do you want to perform these actions?

Lors de la commande `apply`, Terraform vous demande à nouveau de vérifier
les changements qui vont être apportés. En effet il se peut que entre
l'exécution de la commande `plan` et `apply` des mises à jours ont modifiés
l'état du système. Vous pouvez éviter cette dernière confirmation via
la commande `terraform apply -auto-approve`

:::

Vérifiez que le fichier `example.txt` est créé.

### Etat courant des ressources

Suite à la commande `terraform apply` un fichier JSON `terraform.tfstate` a été créé.
Ce fichier conserve un suivi précis de l'état actuel des ressources, c'est
grâce à lui que Terraform peut comparer l’état actuel avec la 
configuration déclarée pour déterminer ce qui doit être ajouté, modifié ou 
supprimé.

Si vous essayez à nouveau la commande `terraform apply`, vous devriez 
obtenir le résultat suivant : 

```sh
local_file.example: Refreshing state... [id=42086c02e03bf671ddf621ed9922f52f2c7a605c]

No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration and found no differences, so no changes are
needed.

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.
```
:::note Suppression de l'état

Supprimez le fichier `terraform.tfstate` et exécutez la commande `terraform apply`. Que se passe-t-il ?

:::

Pour avoir un aperçu des ressources actuelles, exécutez la commande

```sh
terraform state list
```

Pour obtenir des détails sur une ressource particulière, la 
commande `terraform state show` peut vous aider.
Vous devez simplement spécifier le nom de votre ressource.
Par exemple le fichier a été créé via `resource "local_file" "example"`,
son nom est `local_file.example`. Exéutez la commande ci-dessous
pour obtenir les informations sur ce fichier.

```sh
terraform state show local_file.example
```

### Destruction des ressources

Si vous souhaitez supprimer toutes les ressources définies dans la 
configuration Terraform, utilisez la commande suivante : 

```sh
terraform destroy
```

:::warning destruction des ressources

- cette action est irréversible
- Terraform ne peut supprimer que ce qu’il gère, si des ressources ont été 
modifiées manuellement, Terraform pourrait ne pas les supprimer 
correctement.

:::

## Variables

#### Déclarer une variable 

Les variables peuvent être définies dans le fichier main.tf.
Pour sructurer son projet Teraform il est d'usage de les créer 
dans un fichier séparé.

La syntaxe de base est la suivante : 

```sh
variable "nom_de_la_variable" {
  type        = string
  description = "Description de la variable"
  default     = "valeur_par_défaut"
}
```

La liste des arguments et leurs valeurs est 
[consultable en ligne](https://developer.hashicorp.com/terraform/language/values/variables#declaring-an-input-variable).

:::note Secret

Quel argument faut-il ajouter à une variable pour que sa valeur ne soit
jamais affichée dans les outputs ?

:::

Dans le dossier de votre projet Terraform, créez le fichier `variables.tf` 
avec le contenu suivant : 

```sh title="variables.tf"
variable "file_content" {
  description = "Contenu du fichier"
  type        = string
  default     = "Hello, Terraform with variables!"
}

variable "file_name" {
  description = "Nom du fichier"
  type        = string
  default     = "my_file.txt"
}
```

Pour utliser la variable dans le script `main.tf`, il suffit
d'y faire référence via le mot clé var. Par exemple  var.file_content
fait référence à la variable file_content.

Modifiez le fichier `main.tf`comme ci-dessous

```sh title="main.tf"
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

provider "local" {}

resource "local_file" "example" {
  content  = var.file_content
  filename = "${path.module}/${var.file_name}"
}
```

Exécutez le script pour créer le fichier et vérifiez le résultat.

#### Assigner une valeur à une variable 

Seul la valeur par défaut est utilisable pour l'instant.
Si vous souhaitez assigner une valeur à une variable, trois techniques s'offrent à vous : 
1. Créér un fichier `*.tfvars` avec les valeurs à assigner
1. Passer les valeurs en arguments du script
1. Exporter des variables d'environnements

##### Fichier tfvars

Créez dans le reprtoire de travail le fichier terraform.tfvars

```sh title="terraform.tfvars"
file_content="contenu provenant du fichier tfvars"
file_name=nouveau_fichier.txt
```

Exécutez le script pour créer le fichier et vérifiez le résultat.

##### Paramètres de commande

Vous pouvez également passer des variables lors de l'éxécution via

```sh
terraform apply -var="file_name=file-param.txt"
```

##### Variables d'environement

Si vous effacer la valeur de la variable du fichier terraform.tfvars,
vous pouvez définir une variable d'environnement avec le préfixe `TF_VAR`

```sh
export TF_VAR_file_content="contenu de la variable d'environnment"
```

Fichier outputs.tf

Afficher le fichier créé après terraform apply :

```sh title="outputs.tf"
output "file_path" {
  description = "Chemin du fichier créé"
  value       = local_file.example.filename
}
```


Lire l'output via

```sh
terraform output file_path
```


Passer des variables au moment de l'exécution :

```sh
terraform apply -var="file_content=Custom content" -var="file_name=custom.txt"
```

Avec un fichier terraform.tfvars

```sh title="terraform.tfvars"
file_content = "Bonjour, ceci est un test avec terraform.tfvars!"
file_name    = "mon_fichier.txt"
```

Ensuite `terraform apply -auto-approve`

:::info Résumé des commandes terraform

| Commande              | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `terraform init`       | Initialise un répertoire Terraform et télécharge les plugins nécessaires. |
| `terraform plan`       | Affiche un plan des actions que Terraform va effectuer.                  |
| `terraform apply`      | Applique le plan d'exécution en créant, modifiant ou supprimant des ressources. | 
| `terraform destroy`    | Détruit toutes les ressources gérées par Terraform dans le projet.      |
| `terraform validate`   | Vérifie la syntaxe et la configuration des fichiers Terraform.           |
| `terraform show`       | Affiche l’état actuel des ressources gérées, depuis le fichier d’état ou un plan. |
| `terraform output`     | Affiche les sorties définies dans les fichiers `outputs.tf`.            |

:::

## Condition

```sh title="variables.tf"
variable "files" {
  description = "Liste des fichiers à créer avec leur contenu"
  type = list(object({
    name    = string
    content = string
    create  = bool
  }))
  default = [
    { name = "file1.txt", content = "Contenu du fichier 1", create = true },
    { name = "file2.txt", content = "Contenu du fichier 2", create = false },
    { name = "file3.txt", content = "Contenu du fichier 3", create = true }
  ]
}
```

```sh title="main.tf"
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "local" {}

resource "local_file" "files" {
  for_each = { for file in var.files : file.name => file if file.create }

  content  = each.value.content
  filename = "${path.module}/${each.value.name}"
}
```

```sh title="output.tf"
output "created_files" {
  description = "Liste des fichiers créés"
  value       = [for file in local_file.files : file.filename]
}
```



## Structure d'un projet Terraform

```sh
project/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── provider.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── provider.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars
│       └── provider.tf
├── scripts/
│   ├── setup.sh
│   └── cleanup.sh
├── terraform.tfvars
├── main.tf
├── variables.tf
├── outputs.tf
├── provider.tf
├── terraform.tfstate
└── .gitignore
```

## Provider Azure

### Authentification auprès du fournisseur

Il existe plusieurs façons de se connecter. Dans un but d'automatisation, 
vous allez utiliser un Service Principal,

Azure CLI (Command-Line Interface) est un outil en ligne de commande permettant 
de gérer et d'automatiser les ressources et services dans Microsoft Azure. 
Il permet d'interagir avec Azure en utilisant des commandes simples plutôt que 
de passer par le portail web d'Azure.

Commencer par installer Azure CLI : https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

Voici comment créer un Service Principal et obtenir les informations nécessaires :

```sh
az ad sp create-for-rbac --name "my-terraform-sp" --role="Contributor" --scopes="/subscriptions/{subscription-id}"
```

Cela retournera un JSON contenant les informations suivantes :

- `appId` : ID de l'application (Client ID).
- `password` : mot de passe (Client Secret).
- `tenant` : ID du locataire (Tenant ID).

Ensuite, vous devez définir les variables d'environnement pour que 
Terraform puisse s'authentifier en utilisant ces informations :

```sh
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret"
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"
```

### Script

```sh
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-webapp"
  location = "East US"
}

resource "azurerm_container_registry" "acr" {
  name                = "myContainerRegistry1234"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_service_plan" "app_service_plan" {
  name                = "appserviceplan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_app_service" "webapp" {
  name                = "my-web-app"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_service_plan.app_service_plan.id

  site_config {
    linux_fx_version = "DOCKER|${azurerm_container_registry.acr.login_server}/myapp:latest"
  }

  app_settings = {
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
  }
}
```

## Intégration dans un Pipeline 

```sh
my-project/
│
├── Dockerfile                  # Définition de l'image Docker
├── docker-compose.yml          # Configuration des services Docker
│
├── terraform/                  # Répertoire pour les fichiers Terraform
│   ├── main.tf                 # Fichier principal de configuration Terraform
│   ├── variables.tf            # Définition des variables Terraform
│   ├── outputs.tf              # Définitions des outputs de Terraform
│   └── provider.tf             # Configuration du provider (par exemple, AWS, Google Cloud)
│
├── scripts/                    # Scripts utiles pour l'automatisation ou la configuration
│   └── setup.sh                # Par exemple, un script pour initialiser l'environnement
│
├── .gitignore                  # Fichier pour ignorer certains fichiers (ex. fichiers Terraform, Docker)
├── README.md                   # Documentation du projet
├── .dockerignore               # Fichier pour ignorer certains fichiers dans Docker
└── src/                        # Code de l'application
```

Les variables d'environnements crées localement doivent
être crée comme des secrets de votre projet sur le serveur git.esi-bru.be.