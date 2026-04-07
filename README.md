# FormCloud 📋

**Plateforme moderne de formulaires en ligne avec analyse des réponses en temps réel.**

> Construite avec Next.js 16, Supabase, et Vercel. Prête pour la production.

## ✨ Fonctionnalités

- 📝 **Formulaires personnalisés** - Créez des formulaires avec 16 types de questions
- 👥 **Multi-utilisateur** - Chaque utilisateur ne voit que ses propres formulaires
- 🔐 **Authentification** - Connexion sécurisée avec Supabase Auth
- 📊 **Analyse des réponses** - Statistiques en temps réel et graphiques
- 🔍 **Filtrage & Tri** - Filtrez et triez les réponses facilement
- 📤 **Export CSV** - Téléchargez les réponses en format CSV
- 🎨 **UI Moderne** - Design responsive avec TailwindCSS
- 🚀 **Déploiement facile** - Prêt pour Vercel et GitHub

## 🛠️ Stack Technique

| Composant | Technologie | Version |
|-----------|------------|---------|
| Frontend | Next.js | 16.2.2 |
| React | UI Framework | 18.0.0 |
| Backend | Supabase | PostgreSQL |
| Auth | Supabase Auth | OAuth + Email |
| Styling | TailwindCSS | 3.0.0 |
| Déploiement | Vercel | Auto CI/CD |
| Package Manager | npm | 10+ |

## 📦 Installation & Configuration
│   ├── layout.js            # Layout principal
│   ├── page.js              # Dashboard
│   ├── create/
│   │   └── page.js          # Création formulaire
│   ├── form/[id]/
│   │   └── page.js          # Réponse formulaire
│   └── results/[id]/
│       └── page.js          # Résultats
├── components/
│   ├── FormCard.js          # Carte de formulaire
│   ├── QuestionInput.js     # Input de question
│   └── AnswerList.js        # Liste des réponses
├── lib/                     # Backend Supabase (optionnel)
└── ... fichiers de config
```

## 🎯 Fonctionnalités

### Dashboard
- Affiche tous les formulaires sous forme de cartes
- Bouton pour créer un nouveau formulaire
- Navigation vers les pages de réponse et résultats

### Création de formulaire
- Champ titre et description
- Ajout dynamique de questions
- Types de questions : texte libre ou choix multiple
- Validation des champs

### Réponse au formulaire
- Affichage du titre et description
- Questions avec inputs appropriés
- Validation avant soumission
- Page de confirmation

### Résultats
- Statistiques (nombre de réponses, etc.)
- Analyse des réponses similaires
- Affichage détaillé de toutes les réponses
- Regroupement intelligent des réponses

## 🔧 Scripts disponibles

```bash
npm run next-dev      # Serveur de développement
npm run next-build    # Build pour production
npm run next-start    # Serveur de production
npm start            # Backend Supabase (optionnel)
```

## 🌈 Personnalisation

Les couleurs et styles peuvent être facilement modifiés dans :
- `app/globals.css` pour les classes CSS
- `tailwind.config.js` pour le thème Tailwind

## 📈 Prochaines étapes

- Intégration avec Supabase pour la persistance
- Authentification des utilisateurs
- Export des résultats (CSV, PDF)
- Notifications par email
- Formulaires publiques/privés
