# Projet Docusaurus - Laboratoires DevOps

Ce projet contient les énoncés des laboratoires DevOps de l'unité 4DOP1DR.
Docusaurus est utilisé comme générateur de site statique et le résultat est déployé automatiquement
via GitHub Pages.

## URL de publication

Le résultat de ce projet est disponible en ligne sur : [https://lechjo01.github.io/devops/](https://lechjo01.github.io/devops/)


## Comment collaborer ?

Les collaborateurs peuvent :
- **Créer des branches** : Pour développer de nouvelles fonctionnalités ou corriger des problèmes.
- **Commiter directement** : Les commits peuvent être faits directement sur les branches.
- **Proposer des pull requests** : Pour valider les modifications avant leur fusion dans la branche principale (`main`).

### Étapes pour déposer un commitgit push origin ma-nouvelle-fonctionnalite

1. Clonez le dépôt : `git clone `
2. Créez une branche pour vos modifications : `git checkout -b ma-nouvelle-fonctionnalite`
3. Apportez vos modifications, puis commitez-les : `git add . ; git commit -m "Description des changements"`
4. Poussez vos modifications dans le dépôt : `git push origin ma-nouvelle-fonctionnalite`
5. Fusionnez ou proposez une pull request

### Outils nécessaires

- Node.js version >= 18.0 

### Tester vos modifications localement

Avant de pusher vos modifications, vous pouvez les tester localement en suivant ces étapes :
1. Installez les dépendances : `npm install`
2. Lancez le site en mode développement : `npm run start`
3. Consulter le résultat à l'adresse : http://localhost:3000

### Ressources utiles

- Documentation Docusaurus : https://docusaurus.io/docs
