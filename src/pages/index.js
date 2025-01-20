import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
        <div>
          <a
            className="button button--secondary button--lg"
            href="/docs/Premier déploiement/td01-alwaysdata"
          >
            Commencer les travaux dirigés
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Introduction`}
      description="Laboratoires DEVOPS">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
        <div className="text--left padding-horiz--md">
          <h2>Introduction aux pratiques DevOps</h2>
          <p>
            Bienvenue dans cette série de travaux dirigés (TD) dédiés à l’apprentissage des pratiques et des outils fondamentaux du DevOps.
            L’objectif de cette suite de TD est de vous fournir une compréhension pratique et approfondie des concepts clés du DevOps
            tout en vous guidant à travers des scénarios concrets. Vous apprendrez à concevoir, automatiser et optimiser des processus
            pour améliorer le développement et le déploiement d’applications.
          </p>

          <h3>Objectifs pédagogiques</h3>
          <p>
            Au fil des séances, vous serez amenés à :
          </p>
          <ul>
            <li>Comprendre les défis et les bonnes pratiques liés au déploiement d’applications.</li>
            <li>Maîtriser les outils essentiels du DevOps, tels que Docker, GitLab CI/CD, Terraform, et bien d’autres.</li>
            <li>Explorer les interactions entre ces outils dans des scénarios réalistes pour construire et gérer un pipeline complet de livraison continue.</li>
          </ul>

          <h3>Programme des TD</h3>
          <ol>
            <li>
              <strong>Déploiement sur Alwaysdata</strong><br />
              Découvrez les points critiques d’un déploiement initial : configuration des environnements, gestion des dépendances, et publication d’une application sur une plateforme d’hébergement.
            </li>
            <li>
              <strong>Introduction à Docker</strong><br />
              Apprenez à conteneuriser une application. Ces TD vous permettront de comprendre les concepts fondamentaux des conteneurs, comme la création de Dockerfiles et la gestion des images Docker.
            </li>
            <li>
              <strong>Analyse de la qualité de code avec SonarQube</strong><br />
              Découvrez comment évaluer et améliorer la qualité de votre code grâce à SonarQube. Vous apprendrez à intégrer cet outil dans votre workflow pour détecter des problèmes de qualité et de sécurité.
            </li>
            <li>
              <strong>GitLab CI/CD : Créer un pipeline complet</strong><br />
              Apprenez à orchestrer les différentes étapes d’un pipeline DevOps en utilisant GitLab CI/CD. Vous configurerez des interactions entre les outils étudiés (Docker, SonarQube, etc.) pour automatiser le cycle de livraison.
            </li>
            <li>
              <strong>Déploiement sur AWS</strong><br />
              Explorez les concepts de déploiement cloud sur AWS. Vous apprendrez à configurer un environnement de production pour garantir un déploiement fiable.
            </li>
            <li>
              <strong>Infrastructure as Code (IaC) avec Terraform</strong><br />
              Découvrez comment gérer et provisionner vos infrastructures à l’aide de Terraform. Ces TD mettront l’accent sur les bonnes pratiques d’IaC.
            </li>
            <li>
              <strong>Monitoring et Observabilité</strong><br />
              Apprenez à surveiller vos systèmes pour garantir leur performance et leur disponibilité.
            </li>
            <li>
              <strong>Scénarios pratiques : Interactions entre outils DevOps</strong><br />
              Terminez cette série avec des scénarios réalistes qui vous mettront dans des situations nécessitant l’utilisation coordonnée de plusieurs outils
              (par exemple, conteneurisation avec Docker, analyse de qualité avec SonarQube, déploiement automatisé avec GitLab CI/CD, et monitoring).
              Ces exercices vous prépareront à gérer des environnements DevOps dans le monde réel.
            </li>
          </ol>

          <h3>Une approche progressive et pratique</h3>
          <p>
            Chaque TD est conçu pour être autonome tout en construisant progressivement votre maîtrise des outils et des concepts DevOps. À la fin de cette série, vous serez capable de :
          </p>
          <ul>
            <li>Construire un pipeline DevOps.</li>
            <li>Gérer les déploiements cloud et on-premises.</li>
            <li>Automatiser la gestion des infrastructures et des processus de développement.</li>
          </ul>
          <p>
            Nous vous invitons à explorer, expérimenter et poser des questions pour tirer le meilleur parti de cette formation.
          </p>
        </div>
      </main>
    </Layout>
  );
}
