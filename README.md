# React + TypeScript + Vite

## User Database Migration

User authentication and administration use PostgreSQL database `rgevams` and the existing `public.users` table. The legacy `data/users.json` file remains in place for rollback; active API routes do not read or write it.

Configure `SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, and `SQL_DB_NAME=rgevams`, or set `DATABASE_URL` to the matching connection string. Also set `JWT_SECRET` to a unique random value of at least 32 characters. Do not put credentials in source control or terminal output.

1. Validate and back up the source without connecting to PostgreSQL:

  ```powershell
  npm run migrate:users -- --validate-only
  ```

  This creates `data/users.json.backup-<timestamp>` and reports only aggregate validation results.

2. Check PostgreSQL authentication, database identity, and account conflicts without writing rows:

  ```powershell
  npm run migrate:users -- --dry-run
  ```

3. If the dry run reports no conflicts and confirms database `rgevams`, import transactionally:

  ```powershell
  npm run migrate:users
  ```

  The importer hashes plaintext legacy passwords in memory, preserves compatible bcrypt hashes, skips only exact already-imported records, and aborts on identity conflicts. It does not overwrite existing PostgreSQL users.

For rollback, stop the app, preserve the PostgreSQL rows for review, and restore the chosen timestamped JSON backup to `data/users.json`. Reverting the application to a pre-cutover build is required to serve authentication from JSON; do not enable dual reads/writes. Never overwrite the original JSON manually or drop/recreate `public.users`.

The isolated security tests run with:

```powershell
npm run test:user-security
```

Live import and authenticated API verification must wait until the PostgreSQL credentials are valid. No schema/table creation command is needed; `public.users` already exists in the migration history.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
