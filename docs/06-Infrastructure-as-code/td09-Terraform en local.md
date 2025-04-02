# TD 09 - Terraform

Terraform est un outil d’Infrastructure as Code (IaC) développé par HashiCorp. 
Il permet d’automatiser la création, la gestion et la mise à jour d’infrastructures 
sur divers clouds (AWS, Azure, GCP) et services (Docker, Kubernetes, etc.).

### Objectifs 

À l’issue de ce TD, vous serez capable de créer une infrastructure sur Microsoft Azure
en utilisant un script Terraform.

:::warning Pré-requis

1. Connaissance de base en des commandes shell et du déploiement sur Microsoft Azure.
1. Un environnement de travail prêt avec Docker Engine.

:::

## Installation

Terraform propose des binaires précompilés que l'on peut installer manuellement 
en quelques étapes.

1. Télécharger le binaire Terraform : https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
1. Extraire et placer le binaire dans un dossier accessible
1. Ajouter ce dossier à la variable d’environnement PATH 

Vérifier l'installation en exécutant la commande `terraform version`

## Script Terraform

Un script Terraform est un fichier écrit en HCL (HashiCorp Configuration Language) 
qui décrit l’infrastructure qu’on souhaite créer, modifier ou supprimer de manière déclarative.

Les scripts Terraform sont généralement nommés main.tf, mais ils peuvent être 
divisés en plusieurs fichiers (variables.tf, outputs.tf…).

Un fichier main.tf suit généralement cette structure :
- Provider : Définit la connexion à un service (Azure, Docker, AWS…).
- Variables : Rendent le code plus dynamique et réutilisable.
- Ressources : Définissent ce qui doit être créé (VM, conteneurs, bases de données…).
- Outputs : Affichent des informations utiles après l'exécution.

## Provider

Un provider dans Terraform est un plugin qui permet d’interagir avec une 
plateforme (cloud, service, API). Il agit comme un connecteur entre Terraform 
et l’infrastructure que tu veux gérer.

Dans un premier temps, vous allez utiliser un provider local pour apprendre 
les commandes Terraform essentielles avant de passer à la gestion 
d'infrastructure dans le cloud. 

Un provider local permet de créer et de manipuler des ressources sur votre 
machine locale, ce qui est idéal pour se familiariser avec Terraform sans nécessiter 
de connexion à un cloud provider comme AWS ou Azure.

## Premier Script

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

resource "local_file" "example" {
  content  = "Hello, Terraform!"
  filename = "${path.module}/example.txt"
}
```

`terraform {}`

Ce bloc est utilisé pour configurer Terraform. 
Il permet de spécifier des informations liées à l’environnement Terraform global, 
comme la configuration des providers requis pour ce projet.


`required_providers` : Ce sous-bloc indique les providers 
nécessaires pour ce projet. Un provider est un plugin qui permet à Terraform 
d'interagir avec un service externe (dans ce cas, le provider local).

- local : Le nom du provider. Ici, il s'agit du provider local, 
qui permet de créer des ressources locales sur votre machine, comme des fichiers.

- source : Spécifie la source du provider, ici hashicorp/local, 
indiquant que le provider vient du registre officiel de HashiCorp.

- version : Spécifie la version du provider à utiliser. 
L'operator `~>` signifie que Terraform va utiliser la version 2.x, 
mais automatiquement la version la plus récente dans cette plage (par exemple, 2.0 à 2.9).


`provider "local" {}`
Ce bloc définit la configuration du provider local. 
Il est utilisé pour configurer la manière dont Terraform 
va interagir avec le provider local (pour la gestion des ressources 
locales comme les fichiers, les répertoires, etc.).

`resource "local_file" "example" {}`
Ce bloc est utilisé pour définir une ressource. 
Une ressource dans Terraform est un élément que Terraform va créer, 
modifier ou supprimer.

`resource` : Ce mot-clé définit une ressource que Terraform va gérer. 
Ici, la ressource est de type `local_file`, ce qui signifie que 
Terraform va manipuler un fichier local.

`local_file` : Le type de ressource, ici, 
il s'agit de la création d'un fichier local.

`content` : Cette propriété définit le contenu du fichier. 
Ici, il contient simplement le texte "Hello, Terraform!".

`filename` : Cette propriété définit le chemin du fichier qui sera créé. 
Le chemin est spécifié ici par `path.module`, qui fait référence au 
répertoire où se trouve le fichier `.tf` actuel, suivi du nom du fichier example.txt. 

## Commandes

Initialiser le projet

```sh
terraform init
```

Télécharge les providers et prépare Terraform.

Afficher le plan d'exécution

```sh
terraform plan
```

Montre les actions que Terraform va effectuer.

Appliquer la configuration

```sh
terraform apply -auto-approve
```

Crée le fichier example.txt avec le contenu spécifié.

Lister l'état des ressources

```sh
terraform state list
```

Affiche les ressources gérées par Terraform.

Afficher les détails d'une ressource

```sh
terraform state show local_file.example
```

Modifier et re-appliquer

Modifie content dans main.tf, puis :


```sh
terraform apply -auto-approve
```

Détruire les ressources

```sh
terraform destroy -auto-approve
```

| Commande              | Description                                                              | Exemple                       |
|-----------------------|--------------------------------------------------------------------------|-------------------------------|
| `terraform init`       | Initialise un répertoire Terraform et télécharge les plugins nécessaires. | `terraform init`              |
| `terraform plan`       | Affiche un plan des actions que Terraform va effectuer.                  | `terraform plan`              |
| `terraform apply`      | Applique le plan d'exécution en créant, modifiant ou supprimant des ressources. | `terraform apply`             |
| `terraform destroy`    | Détruit toutes les ressources gérées par Terraform dans le projet.      | `terraform destroy`           |
| `terraform validate`   | Vérifie la syntaxe et la configuration des fichiers Terraform.           | `terraform validate`          |
| `terraform show`       | Affiche l’état actuel des ressources gérées, depuis le fichier d’état ou un plan. | `terraform show`             |
| `terraform output`     | Affiche les sorties définies dans les fichiers `outputs.tf`.            | `terraform output`            |


## Variables

Fichier variables.tf

Définition des variables :

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

Fichier main.tf

Utilisation des variables dans la ressource :

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

resource "local_file" "example" {
  content  = var.file_content
  filename = "${path.module}/${var.file_name}"
}
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