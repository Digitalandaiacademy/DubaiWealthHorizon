# DubaiWealth Horizon

Application d'investissement immobilier à Dubai.

## Configuration

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/dubaiwealthhorizon.git
cd dubaiwealthhorizon
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
   - Copiez le fichier `.env.example` en `.env`
   - Remplissez les variables avec vos clés Supabase

```bash
cp .env.example .env
```

4. Initialisez la base de données :
   - Créez un projet sur [Supabase](https://supabase.com)
   - Exécutez les migrations SQL depuis le dossier `supabase/migrations`

5. Lancez l'application :
```bash
npm run dev
```

## Base de données

Le projet utilise Supabase comme base de données. Pour configurer une nouvelle instance :

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Dans les paramètres du projet, récupérez :
   - L'URL du projet (`Project URL`)
   - La clé anonyme (`anon` / `public`)
4. Copiez ces valeurs dans votre fichier `.env`
5. Exécutez les migrations SQL depuis l'interface Supabase

## Déploiement

1. Construisez l'application :
```bash
npm run build
```

2. Les fichiers de production seront générés dans le dossier `dist`