
# 🚀 Guide de Déploiement en Production - Tontine App

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement complet de votre application Tontine en production, de la configuration backend jusqu'à la publication sur les stores.

## 🎯 Prérequis

### Comptes Requis
- [ ] Compte Apple Developer (99$/an) pour iOS
- [ ] Compte Google Play Console (25$ unique) pour Android
- [ ] Compte Expo (gratuit)
- [ ] Serveur de production (Heroku, DigitalOcean, Railway, etc.)
- [ ] Base de données PostgreSQL
- [ ] Comptes fournisseurs de paiement (Orange, MTN, Wave)

### Outils Nécessaires
- [ ] Node.js 18+ installé
- [ ] Expo CLI installé (`npm install -g @expo/cli`)
- [ ] EAS CLI installé (`npm install -g eas-cli`)
- [ ] Git configuré

## 🏗️ Phase 1: Configuration Backend

### 1.1 Déploiement du Serveur API

#### Option A: Heroku (Recommandé pour débuter)
```bash
# 1. Créer une app Heroku
heroku create votre-tontine-api

# 2. Configurer PostgreSQL
heroku addons:create heroku-postgresql:mini

# 3. Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre-jwt-secret-super-securise
heroku config:set ORANGE_CLIENT_ID=votre-orange-client-id
heroku config:set ORANGE_CLIENT_SECRET=votre-orange-client-secret
heroku config:set MTN_SUBSCRIPTION_KEY=votre-mtn-key
heroku config:set WAVE_API_KEY=votre-wave-key

# 4. Déployer
git push heroku main
```

#### Option B: Railway (Moderne et simple)
```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login et déployer
railway login
railway init
railway add postgresql
railway deploy
```

#### Option C: DigitalOcean App Platform
1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Ajoutez une base PostgreSQL managée
4. Déployez automatiquement

### 1.2 Configuration Base de Données

#### Variables d'environnement requises:
```env
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port (optionnel, pour le cache)
```

#### Migrations et seeds:
```bash
# Exécuter les migrations
npm run migrate

# Insérer les données de base
npm run seed
```

### 1.3 Sécurité Backend

#### SSL/TLS
- [ ] Certificat SSL configuré (Let's Encrypt gratuit)
- [ ] Redirection HTTP → HTTPS
- [ ] HSTS headers configurés

#### CORS
```javascript
// Configuration CORS pour production
app.use(cors({
  origin: ['https://votre-domaine.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

#### Rate Limiting
```javascript
// Protection contre les attaques
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite par IP
}));
```

## 💳 Phase 2: Intégration Mobile Money

### 2.1 Orange Money Côte d'Ivoire

#### Étapes d'intégration:
1. **Contact Commercial**
   - Email: api-support@orange.ci
   - Téléphone: +225 07 07 07 07
   - Présenter le projet tontine

2. **Documentation Requise**
   - Business plan de l'application
   - Prévisions de volume de transactions
   - Mesures de sécurité implémentées

3. **Environnement Sandbox**
   ```javascript
   // Configuration sandbox
   const orangeConfig = {
     baseUrl: 'https://api.orange.com/orange-money-webpay/dev/v1',
     clientId: 'votre-client-id-sandbox',
     clientSecret: 'votre-client-secret-sandbox'
   };
   ```

4. **Tests Obligatoires**
   - [ ] Paiement réussi
   - [ ] Paiement échoué (solde insuffisant)
   - [ ] Timeout de paiement
   - [ ] Annulation utilisateur

5. **Passage en Production**
   - Validation des tests par Orange
   - Signature du contrat commercial
   - Réception des clés de production

### 2.2 MTN Mobile Money

#### Processus d'inscription:
1. **Compte Développeur**
   - Inscription sur momodeveloper.mtn.com
   - Vérification d'identité

2. **Souscription API**
   - Produit "Collections" pour recevoir des paiements
   - Produit "Disbursements" pour les décaissements (optionnel)

3. **Configuration Sandbox**
   ```javascript
   const mtnConfig = {
     baseUrl: 'https://sandbox.momodeveloper.mtn.com',
     subscriptionKey: 'votre-subscription-key',
     environment: 'sandbox'
   };
   ```

4. **Tests et Validation**
   - Tests avec numéros sandbox fournis
   - Validation du flux de paiement complet

### 2.3 Wave

#### Approche Directe:
1. **Contact Commercial**
   - Email: developers@wave.com
   - Présentation du projet tontine
   - Négociation des conditions

2. **Avantages Wave**
   - Plus ouvert aux fintechs locales
   - Frais négociables selon le volume
   - Support technique réactif

## 🔔 Phase 3: Notifications Push

### 3.1 Configuration Expo Push Notifications

#### Dans votre app:
```javascript
// services/notificationService.ts
const projectId = 'votre-expo-project-id'; // Remplacer par votre ID

// Obtenir le token push
const token = await Notifications.getExpoPushTokenAsync({
  projectId: projectId,
});
```

#### Configuration serveur:
```javascript
// Backend - envoi de notifications
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const sendNotification = async (pushToken, title, body) => {
  const messages = [{
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { /* données custom */ },
  }];
  
  await expo.sendPushNotificationsAsync(messages);
};
```

### 3.2 Alternative Firebase (Optionnel)

Si vous préférez Firebase Cloud Messaging:

1. **Créer un projet Firebase**
2. **Ajouter les apps iOS/Android**
3. **Télécharger google-services.json**
4. **Configurer les certificats push iOS**

## 📱 Phase 4: Configuration App Mobile

### 4.1 Mise à jour de l'URL API

Dans `services/apiService.ts`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://votre-api-production.herokuapp.com/api'; // ← Remplacer ici
```

Ou utiliser l'interface de configuration dans l'app:
1. Aller dans Paramètres → Guide de Production
2. Cliquer sur "Mettre à jour API_BASE_URL"
3. Entrer votre URL de production
4. Tester la connexion

### 4.2 Configuration app.json

```json
{
  "expo": {
    "name": "Tontine CI",
    "slug": "tontine-ci",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.votreentreprise.tontine"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.votreentreprise.tontine"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "votre-expo-project-id"
      }
    }
  }
}
```

## 🏪 Phase 5: Préparation App Store

### 5.1 Assets Requis

#### Icônes
- [ ] Icône app 1024x1024px (PNG, sans transparence)
- [ ] Icônes adaptatives Android (foreground + background)

#### Captures d'écran
- [ ] iPhone 6.7" (1290x2796px) - 3 captures minimum
- [ ] iPhone 6.5" (1242x2688px) - 3 captures minimum  
- [ ] iPhone 5.5" (1242x2208px) - 3 captures minimum
- [ ] iPad Pro 12.9" (2048x2732px) - optionnel
- [ ] Android Phone (1080x1920px) - 2-8 captures
- [ ] Android Tablet (1200x1920px) - optionnel

#### Textes Marketing
- [ ] Nom de l'app (30 caractères max)
- [ ] Sous-titre (30 caractères max)
- [ ] Description courte (80 caractères)
- [ ] Description complète (4000 caractères max)
- [ ] Mots-clés (100 caractères, séparés par virgules)
- [ ] Notes de version

### 5.2 Documents Légaux

#### Politique de Confidentialité
Doit couvrir:
- Collecte des données personnelles
- Utilisation des données de paiement
- Partage avec les fournisseurs Mobile Money
- Droits des utilisateurs (RGPD)
- Contact pour les questions

#### Conditions d'Utilisation
Doit inclure:
- Règles d'utilisation de l'app
- Responsabilités des utilisateurs
- Gestion des litiges
- Frais et commissions
- Résiliation de compte

### 5.3 Exemple de Description App Store

```
🎯 TITRE: Tontine CI - Épargne Collective

💡 SOUS-TITRE: Gérez vos tontines facilement

📝 DESCRIPTION:
Tontine CI révolutionne l'épargne collective en Côte d'Ivoire ! 

✨ FONCTIONNALITÉS PRINCIPALES:
• Créez et gérez vos cercles de tontine
• Paiements sécurisés via Orange Money, MTN MoMo et Wave
• Suivi en temps réel des cotisations
• Rappels automatiques par notification
• Invitations faciles par WhatsApp/SMS
• Historique complet des transactions

🔒 SÉCURITÉ GARANTIE:
• Chiffrement des données bancaires
• Authentification par OTP
• Conformité aux standards internationaux

💰 TRANSPARENT:
• Commission fixe de 2% par cycle
• Pas de frais cachés
• Frais de retard redistribués au groupe

🎯 MOTS-CLÉS: 
tontine, épargne, mobile money, orange money, mtn momo, wave, côte d'ivoire, finance, groupe
```

## 🚀 Phase 6: Build et Déploiement

### 6.1 Configuration EAS

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login Expo
eas login

# Configurer le projet
eas build:configure
```

### 6.2 Configuration eas.json

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 6.3 Build de Production

```bash
# Build Android (AAB pour Play Store)
eas build --platform android --profile production

# Build iOS (pour App Store)
eas build --platform ios --profile production

# Build les deux plateformes
eas build --platform all --profile production
```

### 6.4 Soumission aux Stores

#### App Store iOS
```bash
# Soumission automatique
eas submit --platform ios

# Ou manuel via App Store Connect
# 1. Télécharger l'IPA depuis Expo
# 2. Upload via Transporter ou Xcode
# 3. Configurer dans App Store Connect
```

#### Google Play Store
```bash
# Soumission automatique
eas submit --platform android

# Ou manuel via Play Console
# 1. Télécharger l'AAB depuis Expo
# 2. Upload dans Play Console
# 3. Configurer la fiche store
```

## 🧪 Phase 7: Tests de Production

### 7.1 Tests Utilisateurs

#### Plan de Test
- [ ] 5-10 cercles de test avec vrais utilisateurs
- [ ] 50-100 utilisateurs beta
- [ ] Tests sur différents appareils (Android/iOS)
- [ ] Tests de connectivité (WiFi/4G/3G)

#### Scénarios Critiques
- [ ] Inscription complète avec OTP
- [ ] Création de tontine avec tous les paramètres
- [ ] Invitation et acceptation de membres
- [ ] Paiement réel avec chaque fournisseur
- [ ] Réception de notifications
- [ ] Gestion des retards de paiement
- [ ] Décaissement au bénéficiaire

### 7.2 Tests de Paiement

#### Environnement Sandbox
- [ ] Paiements Orange Money (succès/échec)
- [ ] Paiements MTN MoMo (succès/échec)
- [ ] Paiements Wave (succès/échec)
- [ ] Gestion des timeouts
- [ ] Annulations utilisateur
- [ ] Montants limites (min/max)

#### Tests de Charge
- [ ] Paiements simultanés (10+ utilisateurs)
- [ ] Pic de trafic simulé
- [ ] Récupération après panne
- [ ] Performance base de données

### 7.3 Audit de Sécurité

#### Points de Contrôle
- [ ] Chiffrement des données sensibles
- [ ] Protection contre l'injection SQL
- [ ] Validation des entrées utilisateur
- [ ] Gestion sécurisée des tokens
- [ ] Protection CSRF/XSS
- [ ] Rate limiting fonctionnel
- [ ] Logs d'audit complets

#### Tests de Pénétration
- [ ] Tentatives d'accès non autorisé
- [ ] Manipulation des requêtes API
- [ ] Tests de force brute
- [ ] Validation des certificats SSL

## 📊 Phase 8: Monitoring et Maintenance

### 8.1 Monitoring Serveur

#### Métriques à Surveiller
- [ ] Temps de réponse API (< 500ms)
- [ ] Taux d'erreur (< 1%)
- [ ] Utilisation CPU/RAM
- [ ] Espace disque disponible
- [ ] Connexions base de données

#### Outils Recommandés
- **Heroku**: Heroku Metrics (inclus)
- **DigitalOcean**: Monitoring intégré
- **Externe**: New Relic, DataDog, Sentry

### 8.2 Monitoring App Mobile

#### Analytics
- [ ] Nombre d'utilisateurs actifs
- [ ] Taux de rétention (J1, J7, J30)
- [ ] Taux de conversion (inscription → première tontine)
- [ ] Temps de session moyen
- [ ] Écrans les plus visités

#### Crash Reporting
- [ ] Expo Application Services (gratuit)
- [ ] Sentry (recommandé pour production)
- [ ] Bugsnag (alternative)

### 8.3 Support Utilisateur

#### Canaux de Support
- [ ] Email: support@votre-domaine.com
- [ ] WhatsApp Business: +225 XX XX XX XX
- [ ] FAQ intégrée dans l'app
- [ ] Chat en ligne (optionnel)

#### Documentation Utilisateur
- [ ] Guide d'utilisation PDF
- [ ] Vidéos tutoriels
- [ ] FAQ complète
- [ ] Résolution des problèmes courants

## ✅ Checklist Finale de Lancement

### Backend ✅
- [ ] Serveur déployé et accessible via HTTPS
- [ ] Base de données PostgreSQL configurée et sauvegardée
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting et sécurité activés
- [ ] Monitoring et logs configurés

### Paiements ✅
- [ ] Au moins un fournisseur Mobile Money intégré et testé
- [ ] Environnement sandbox validé
- [ ] Clés de production obtenues et configurées
- [ ] Tests de paiement réels effectués
- [ ] Gestion d'erreurs implémentée

### Application ✅
- [ ] URL API de production configurée
- [ ] Build de production créé avec EAS
- [ ] Tests utilisateurs terminés avec succès
- [ ] Notifications push fonctionnelles
- [ ] Assets App Store préparés

### Légal et Conformité ✅
- [ ] Politique de confidentialité rédigée et publiée
- [ ] Conditions d'utilisation finalisées
- [ ] Conformité RGPD/protection des données
- [ ] Licences et autorisations obtenues

### Stores ✅
- [ ] Comptes développeur créés et vérifiés
- [ ] Fiches App Store/Play Store complétées
- [ ] Captures d'écran et descriptions finalisées
- [ ] Soumission pour review effectuée

### Support ✅
- [ ] Équipe de support formée et disponible
- [ ] Documentation utilisateur créée
- [ ] Canaux de communication configurés
- [ ] Processus de gestion des incidents défini

## 🎉 Lancement !

Une fois tous les éléments validés:

1. **Soft Launch** (recommandé)
   - Lancement dans 1-2 régions test
   - Monitoring intensif pendant 1 semaine
   - Corrections des bugs critiques

2. **Lancement National**
   - Communication marketing
   - Monitoring continu
   - Support utilisateur réactif

3. **Post-Lancement**
   - Collecte des feedbacks utilisateurs
   - Itérations et améliorations
   - Planification des nouvelles fonctionnalités

## 📞 Support et Ressources

### Documentation Technique
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [EAS Submit Guide](https://docs.expo.dev/submit/introduction/)

### APIs Mobile Money
- [Orange Developer](https://developer.orange.com/)
- [MTN MoMo Developer](https://momodeveloper.mtn.com/)
- [Wave API Documentation](https://developers.wave.com/)

### App Stores
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

---

**Bonne chance avec le lancement de votre Tontine App ! 🚀**

*Ce guide est un document vivant. N'hésitez pas à l'adapter selon vos besoins spécifiques et les évolutions des plateformes.*
