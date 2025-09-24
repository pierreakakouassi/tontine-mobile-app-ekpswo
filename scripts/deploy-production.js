
#!/usr/bin/env node
/**
 * Script de déploiement automatisé pour Tontine CI
 * 
 * Ce script guide l'utilisateur à travers le processus de déploiement
 * et effectue les vérifications nécessaires avant le lancement.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Script de Déploiement Tontine CI');
console.log('=====================================\n');

// Vérifications préliminaires
function checkPrerequisites() {
  console.log('📋 Vérification des prérequis...\n');
  
  const checks = [
    {
      name: 'Node.js version',
      command: 'node --version',
      expected: 'v18',
    },
    {
      name: 'Expo CLI',
      command: 'expo --version',
      expected: '6.',
    },
    {
      name: 'EAS CLI',
      command: 'eas --version',
      expected: 'eas-cli/',
    },
  ];

  checks.forEach(check => {
    try {
      const result = execSync(check.command, { encoding: 'utf8' });
      const success = result.includes(check.expected);
      console.log(`${success ? '✅' : '❌'} ${check.name}: ${result.trim()}`);
    } catch (error) {
      console.log(`❌ ${check.name}: Non installé`);
    }
  });
  
  console.log('\n');
}

// Vérification de la configuration
function checkConfiguration() {
  console.log('⚙️  Vérification de la configuration...\n');
  
  const configFiles = [
    'app.json',
    'eas.json',
    'package.json',
  ];
  
  configFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  });
  
  console.log('\n');
}

// Guide de déploiement interactif
function deploymentGuide() {
  console.log('📖 Guide de Déploiement\n');
  
  const steps = [
    {
      title: '1. Configuration Backend',
      description: 'Déployez votre API sur Heroku, Railway ou DigitalOcean',
      commands: [
        'Configurez votre serveur de production',
        'Mettez à jour API_BASE_URL dans services/apiService.ts',
        'Testez la connexion API',
      ],
    },
    {
      title: '2. Intégrations Mobile Money',
      description: 'Configurez Orange Money, MTN MoMo et Wave',
      commands: [
        'Obtenez les clés API de production',
        'Testez les paiements en sandbox',
        'Configurez les webhooks de callback',
      ],
    },
    {
      title: '3. Configuration App',
      description: 'Préparez l\'application pour la production',
      commands: [
        'Mettez à jour app.json avec vos informations',
        'Configurez les notifications push',
        'Préparez les assets (icônes, screenshots)',
      ],
    },
    {
      title: '4. Build et Déploiement',
      description: 'Créez les builds de production',
      commands: [
        'eas build --platform android --profile production',
        'eas build --platform ios --profile production',
        'eas submit --platform all',
      ],
    },
  ];
  
  steps.forEach(step => {
    console.log(`\n${step.title}`);
    console.log(`${step.description}\n`);
    step.commands.forEach(command => {
      console.log(`  • ${command}`);
    });
  });
  
  console.log('\n');
}

// Commandes de build
function showBuildCommands() {
  console.log('🔨 Commandes de Build\n');
  
  const commands = [
    {
      name: 'Build Android (APK pour test)',
      command: 'eas build --platform android --profile preview',
    },
    {
      name: 'Build Android (AAB pour Play Store)',
      command: 'eas build --platform android --profile production',
    },
    {
      name: 'Build iOS (pour App Store)',
      command: 'eas build --platform ios --profile production',
    },
    {
      name: 'Build toutes plateformes',
      command: 'eas build --platform all --profile production',
    },
    {
      name: 'Soumission Android',
      command: 'eas submit --platform android',
    },
    {
      name: 'Soumission iOS',
      command: 'eas submit --platform ios',
    },
  ];
  
  commands.forEach(cmd => {
    console.log(`${cmd.name}:`);
    console.log(`  ${cmd.command}\n`);
  });
}

// Checklist finale
function finalChecklist() {
  console.log('✅ Checklist Finale de Déploiement\n');
  
  const checklist = [
    'Backend déployé et accessible via HTTPS',
    'Base de données PostgreSQL configurée',
    'Au moins un fournisseur Mobile Money intégré',
    'Notifications push configurées',
    'Tests utilisateurs effectués',
    'Politique de confidentialité rédigée',
    'Conditions d\'utilisation finalisées',
    'Icônes et screenshots préparés',
    'Comptes développeur créés (Apple/Google)',
    'Builds de production créés',
    'Équipe de support prête',
  ];
  
  checklist.forEach((item, index) => {
    console.log(`${index + 1}. [ ] ${item}`);
  });
  
  console.log('\n');
}

// Ressources utiles
function showResources() {
  console.log('📚 Ressources Utiles\n');
  
  const resources = [
    {
      name: 'Documentation Expo',
      url: 'https://docs.expo.dev/',
    },
    {
      name: 'Guide EAS Build',
      url: 'https://docs.expo.dev/build/introduction/',
    },
    {
      name: 'Orange Developer',
      url: 'https://developer.orange.com/',
    },
    {
      name: 'MTN MoMo Developer',
      url: 'https://momodeveloper.mtn.com/',
    },
    {
      name: 'App Store Connect',
      url: 'https://appstoreconnect.apple.com/',
    },
    {
      name: 'Google Play Console',
      url: 'https://play.google.com/console/',
    },
  ];
  
  resources.forEach(resource => {
    console.log(`• ${resource.name}: ${resource.url}`);
  });
  
  console.log('\n');
}

// Exécution du script
function main() {
  checkPrerequisites();
  checkConfiguration();
  deploymentGuide();
  showBuildCommands();
  finalChecklist();
  showResources();
  
  console.log('🎉 Bonne chance avec votre déploiement !');
  console.log('Pour plus d\'aide, consultez le guide dans l\'app : Paramètres → Guide de Production\n');
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  checkConfiguration,
  deploymentGuide,
  showBuildCommands,
  finalChecklist,
  showResources,
};
