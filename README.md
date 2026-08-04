# 🎯 CoolLEDX Ris-Timing - React Native Edition

**Migration complète de Python vers React Native** | iOS & Android | Telemetry en direct pour motorsport

---

## 📱 À propos

CoolLEDX Ris-Timing est une application mobile qui contrôle des panneaux LED de 96x16 pixels via Bluetooth pour afficher en temps réel :
- ⏱️ **Temps de tour** en direct depuis l'API RIS-Timing
- 🏎️ **Position** du pilote en championnat
- 🔄 **Mise à jour** automatique toutes les 5 secondes

C'est une migration complète de la version Python originale vers React Native, compatible **iOS et Android**.

---

## 🚀 Démarrage rapide

### 1. Installation
```bash
cd CoolLedX-RN
npm install
```

### 2. Configuration
```bash
cp .env.example .env
# Éditer .env avec vos paramètres API
```

### 3. Lancer
```bash
npm run start
```

Pour plus de détails, consultez **[SETUP.md](./SETUP.md)**

---

## 📋 Fonctionnalités

| Fonctionnalité | Description | Status |
|---|---|:---:|
| 🔍 **BLE Scanner** | Scanne et connexion aux panneaux LED | ✅ |
| 📊 **Live Telemetry** | Affichage en direct des temps de tour | ✅ |
| ⚙️ **Settings** | Configuration API et numéro voiture | ✅ |
| 🔄 **Auto-update** | Mise à jour automatique via intervalle configurable | ✅ |
| 💾 **State Persistence** | Redux pour gestion d'état centralisée | ✅ |
| 📱 **iOS Support** | Build native pour iPhone/iPad | ✅ |
| 🤖 **Android Support** | Build native pour appareils Android | ✅ |

---

## 🏗️ Architecture

### Services (Business Logic)

**BLE & Protocole**
- `bleService.ts` - Communication Bluetooth (scan, connect, send)
- `commandService.ts` - Encodage protocole LED (commands, checksums)

**Telemetry**
- `apiService.ts` - Fetch données API RIS-Timing
- `jtImageGenerator.ts` - Génération bitmap → images JT

### UI Screens
- **DeviceScanScreen** - Scanner et connexion
- **TelemetryScreen** - Affichage live avec update auto
- **SettingsScreen** - Configuration API/UUID/Car#

### State Management
- **Redux Toolkit** - BLE state, Telemetry state, Settings state

### Navigation
- **React Navigation** - Bottom tab tabs (Scan, Telemetry, Settings)

```
App
├── Redux Store
│   ├── BLE Slice
│   ├── Telemetry Slice
│   └── Settings Slice
└── Navigation (Tab)
    ├── DeviceScanScreen
    ├── TelemetryScreen
    └── SettingsScreen
```

---

## 📦 Dépendances principales

```json
{
  "react-native": "0.86.2",
  "react-native-ble-plx": "Bluetooth",
  "@react-navigation": "Navigation",
  "@reduxjs/toolkit": "State",
  "axios": "HTTP"
}
```

---

## 📝 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP.md](./SETUP.md)** | Installation et lancement |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | Architecture détaillée et port Python |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historique de la migration |

---

## 🔌 Configuration

### Permissions requises

**Android**
- Bluetooth, location (pour scan)

**iOS**
- Bluetooth, location (pour scan)

### Variables d'environnement
Voir `.env.example` :
- `REACT_APP_API_URL` - URL API RIS-Timing
- `REACT_APP_UUID` - Votre UUID
- `REACT_APP_CAR_NUMBER` - Numéro voiture

---

## 📊 Structure des dossiers

```
CoolLedX-RN/
├── src/
│   ├── services/              # Logique métier
│   │   ├── bleService.ts
│   │   ├── commandService.ts
│   │   ├── apiService.ts
│   │   └── jtImageGenerator.ts
│   ├── screens/               # UI Screens
│   │   ├── DeviceScanScreen.tsx
│   │   ├── TelemetryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/                 # Redux
│   │   └── store.ts
│   ├── config/                # Configuration
│   │   └── config.ts
│   └── components/            # Composants réutilisables
├── App.tsx                     # Root component
├── app.json                    # Configuration Expo
├── package.json                # Dependencies
├── SETUP.md                    # Guide démarrage
├── MIGRATION_GUIDE.md          # Guide technique
└── CHANGELOG.md                # Historique
```

---

## 🎓 Migration depuis Python

### Ports principaux

| Python | React Native | Module |
|--------|---|---|
| `core/client.py` | `bleService.ts` | BLE communication |
| `core/commands.py` | `commandService.ts` | Command encoding |
| `core/basic_protocol.py` | `commandService.ts` | Protocol (escape, checksum) |
| `core/render.py` | `jtImageGenerator.ts` | Image rendering |
| `pro/apiCall.py` | `apiService.ts` | API calls |
| `pro/generate_jt.py` | `jtImageGenerator.ts` | JT generation |

### Changements clés

| Aspect | Avant (Python) | Après (RN) |
|--------|---|---|
| Bluetooth | Bleak library | React Native BLE Plx |
| Async | asyncio | Promise/async-await |
| State | Local variables | Redux Toolkit |
| UI | CLI | React Native tabs |
| Storage | Local files | Redux + AsyncStorage |

---

## 🧪 Testing

À implémenter :
- [ ] Unit tests (Jest)
- [ ] Integration tests (BLE + API)
- [ ] E2E tests (Detox)

---

## 🐛 Troubleshooting

**Aucun appareil trouvé ?**
- Vérifier Bluetooth activé
- Vérifier les permissions (location sur Android)
- Rapprocher le téléphone

**Erreur connexion ?**
- Vérifier portée Bluetooth
- Vérifier que le panneau n'est pas connecté ailleurs
- Redémarrer le panneau

**Erreur API ?**
- Vérifier URL API et UUID dans Settings
- Vérifier le car number existe
- Vérifier connexion Internet

Voir **[SETUP.md](./SETUP.md#-troubleshooting)** pour plus.

---

## 🚀 Prochaines étapes

### Phase 2 : Testing
- [ ] Test réel sur device CoolLEDX
- [ ] Test Android et iOS
- [ ] Debug et optimisations

### Phase 3 : Features
- [ ] Support multi-panneaux
- [ ] Offline mode avec cache
- [ ] Historique telemetry

### Phase 4 : Deployment
- [ ] App Store (iOS)
- [ ] Google Play (Android)

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Langages | TypeScript + React Native |
| Fichiers | 4 services + 3 screens + 1 store |
| Dépendances | 7 principales |
| Lignes de code | ~1,500 TypeScript |
| État d'avancement | ✅ Structure complète |

---

## 📞 Support

- 📖 Consultez la **[documentation complète](./MIGRATION_GUIDE.md)**
- 🐛 Reportez les bugs avec détails d'erreur
- 💡 Proposez des améliorations

---

## 📄 License

Ce projet combine deux licences :
- **Core** : MIT License (UpDryTwist + TheDavSmasher)
- **Pro** : Propriété de mallo2

Voir `core/LICENSE` et `pro/LICENSE` pour détails.

---

## ✨ Crédits

- **UpDryTwist** - CoolLEDX driver original
- **TheDavSmasher** - Refactoring driver (fixes)
- **mallo2** - Integration telemetry + migration React Native

---

**Version:** 1.0.0  
**Status:** ✅ Prête pour testing  
**Dernière mise à jour:** 2026-08-04

[📖 Documentation complète](./MIGRATION_GUIDE.md) | [🚀 Démarrer](./SETUP.md) | [📊 Changelog](./CHANGELOG.md)
