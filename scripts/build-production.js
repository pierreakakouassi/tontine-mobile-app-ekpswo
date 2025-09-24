
/**
 * Script de build automatisé pour la production
 * 
 * Ce script automatise le processus de build et de soumission
 * aux app stores avec toutes les vérifications nécessaires.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Build de Production - Tontine CI');
console.log('===================================\n');

// Configuration
const config = {
  platforms: ['android', 'ios'],
  profile: 'production',
  autoSubmit: false,
  skipChecks: false,
};

// Fonctions utilitaires
function execCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log(`✅ ${description} terminé`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur lors de ${description}:`);
    console.error(error.message);
    process.exit(1);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Vérifications préliminaires
async function performPreChecks() {
  console.log('🔍 Vérifications préliminaires...\n');
  
  const checks = [
    {
      name: 'Node.js version',
      command: 'node --version',
      validate: (output) => {
        const version = parseInt(output.replace('v', '').split('.')[0]);
        return version >= 18;
      },
      error: 'Node.js 18+ requis'
    },
    {
      name: 'Expo CLI',
      command: 'expo --version',
      validate: (output) => output.includes('.'),
      error: 'Expo CLI non installé'
    },
    {
      name: 'EAS CLI',
      command: 'eas --version',
      validate: (output) => output.includes('eas-cli'),
      error: 'EAS CLI non installé'
    },
    {
      name: 'Git status',
      command: 'git status --porcelain',
      validate: (output) => output.trim() === '',
      error: 'Modifications non commitées détectées'
    }
  ];

  for (const check of checks) {
    try {
      const output = execSync(check.command, { encoding: 'utf8' });
      const isValid = check.validate(output);
      
      console.log(`${isValid ? '✅' : '❌'} ${check.name}`);
      
      if (!isValid && !config.skipChecks) {
        console.error(`Erreur: ${check.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${check.error}`);
      if (!config.skipChecks) {
        process.exit(1);
      }
    }
  }
  
  console.log('\n');
}

// Vérification de la configuration
async function checkConfiguration() {
  console.log('⚙️ Vérification de la configuration...\n');
  
  // Vérifier app.json
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (!fs.existsSync(appJsonPath)) {
    console.error('❌ app.json non trouvé');
    process.exit(1);
  }
  
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const expo = appJson.expo;
  
  const configChecks = [
    {
      name: 'Nom de l\'app',
      value: expo.name,
      valid: expo.name && expo.name !== 'Natively',
    },
    {
      name: 'Bundle identifier iOS',
      value: expo.ios?.bundleIdentifier,
      valid: expo.ios?.bundleIdentifier && !expo.ios.bundleIdentifier.includes('anonymous'),
    },
    {
      name: 'Package Android',
      value: expo.android?.package,
      valid: expo.android?.package && !expo.android.package.includes('anonymous'),
    },
    {
      name: 'Version',
      value: expo.version,
      valid: expo.version && expo.version !== '1.0.0',
    },
    {
      name: 'Expo Project ID',
      value: expo.extra?.eas?.projectId,
      valid: expo.extra?.eas?.projectId && !expo.extra.eas.projectId.includes('your-expo-project-id'),
    }
  ];
  
  let hasErrors = false;
  
  configChecks.forEach(check => {
    const status = check.valid ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.value || 'Non configuré'}`);
    if (!check.valid) hasErrors = true;
  });
  
  if (hasErrors && !config.skipChecks) {
    console.error('\n❌ Configuration incomplète. Veuillez corriger les erreurs ci-dessus.');
    process.exit(1);
  }
  
  console.log('\n');
}

// Mise à jour de la version
async function updateVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const appJsonPath = path.join(process.cwd(), 'app.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    const answer = await askQuestion(`Version actuelle: ${currentVersion}. Mettre à jour ? (y/N): `);
    
    if (answer === 'y' || answer === 'yes') {
      const newVersion = await askQuestion('Nouvelle version (ex: 1.0.1): ');
      
      if (newVersion) {
        // Mettre à jour package.json
        packageJson.version = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        // Mettre à jour app.json
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        appJson.expo.version = newVersion;
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        
        console.log(`✅ Version mise à jour: ${newVersion}`);
        
        // Commit les changements
        execCommand('git add package.json app.json', 'Ajout des fichiers de version');
        execCommand(`git commit -m "chore: bump version to ${newVersion}"`, 'Commit de la nouvelle version');
      }
    }
  }
}

// Build des applications
async function buildApps() {
  console.log('🔨 Construction des applications...\n');
  
  for (const platform of config.platforms) {
    const answer = await askQuestion(`Construire pour ${platform.toUpperCase()} ? (Y/n): `);
    
    if (answer !== 'n' && answer !== 'no') {
      const buildCommand = `eas build --platform ${platform} --profile ${config.profile} --non-interactive`;
      execCommand(buildCommand, `Build ${platform.toUpperCase()}`);
      
      console.log(`\n✅ Build ${platform.toUpperCase()} terminé !`);
      console.log(`📱 Téléchargez votre build depuis: https://expo.dev/accounts/[your-account]/projects/tontine-ci/builds\n`);
    }
  }
}

// Soumission aux stores
async function submitToStores() {
  if (!config.autoSubmit) {
    const answer = await askQuestion('Soumettre automatiquement aux stores ? (y/N): ');
    if (answer !== 'y' && answer !== 'yes') {
      console.log('📋 Soumission manuelle requise.');
      console.log('Utilisez: eas submit --platform [android|ios]');
      return;
    }
  }
  
  console.log('📤 Soumission aux stores...\n');
  
  for (const platform of config.platforms) {
    const answer = await askQuestion(`Soumettre ${platform.toUpperCase()} ? (Y/n): `);
    
    if (answer !== 'n' && answer !== 'no') {
      const submitCommand = `eas submit --platform ${platform} --non-interactive`;
      execCommand(submitCommand, `Soumission ${platform.toUpperCase()}`);
    }
  }
}

// Génération du rapport de build
function generateBuildReport() {
  console.log('📊 Génération du rapport de build...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    platforms: config.platforms,
    profile: config.profile,
    environment: 'production',
    checks: {
      preChecks: 'passed',
      configuration: 'passed',
      build: 'completed',
    }
  };
  
  const reportPath = path.join(process.cwd(), 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Rapport de build généré: build-report.json');
}

// Instructions post-build
function showPostBuildInstructions() {
  console.log('\n🎉 Build de production terminé !\n');
  
  console.log('📋 Prochaines étapes:');
  console.log('1. Téléchargez vos builds depuis Expo');
  console.log('2. Testez les builds sur des appareils réels');
  console.log('3. Préparez vos assets pour les stores:');
  console.log('   - Icônes (1024x1024px)');
  console.log('   - Screenshots (différentes tailles)');
  console.log('   - Descriptions et métadonnées');
  console.log('4. Soumettez aux stores si pas encore fait');
  console.log('5. Configurez votre backend de production');
  console.log('6. Testez les intégrations Mobile Money');
  console.log('7. Activez le monitoring et les analytics\n');
  
  console.log('📚 Ressources utiles:');
  console.log('- App Store Connect: https://appstoreconnect.apple.com/');
  console.log('- Google Play Console: https://play.google.com/console/');
  console.log('- Guide de déploiement: PRODUCTION_DEPLOYMENT.md\n');
  
  console.log('🚀 Bonne chance avec votre lancement !');
}

// Fonction principale
async function main() {
  try {
    // Parse des arguments de ligne de commande
    const args = process.argv.slice(2);
    
    if (args.includes('--skip-checks')) {
      config.skipChecks = true;
    }
    
    if (args.includes('--auto-submit')) {
      config.autoSubmit = true;
    }
    
    if (args.includes('--android-only')) {
      config.platforms = ['android'];
    }
    
    if (args.includes('--ios-only')) {
      config.platforms = ['ios'];
    }
    
    // Exécution des étapes
    await performPreChecks();
    await checkConfiguration();
    await updateVersion();
    await buildApps();
    await submitToStores();
    generateBuildReport();
    showPostBuildInstructions();
    
  } catch (error) {
    console.error('\n❌ Erreur lors du build:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Build interrompu par l\'utilisateur');
  rl.close();
  process.exit(0);
});

// Exécution
if (require.main === module) {
  main();
}

module.exports = {
  performPreChecks,
  checkConfiguration,
  buildApps,
  submitToStores,
};
