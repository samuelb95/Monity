# Monity

Application React/Vite de gestion de budget.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Structure

Le code applicatif est organise dans `src/` avec une separation entre:

- `app/`: orchestration de l'application et routes locales.
- `components/`: layout, composants UI reutilisables et futurs widgets.
- `pages/`: pages composees a partir des composants.
- `context/`: contexte de donnees finance, pret pour une future source externe.
- `types/`: types metier.
- `utils/`: fonctions pures de formatage et calcul.
- `styles/`: styles globaux Tailwind.
