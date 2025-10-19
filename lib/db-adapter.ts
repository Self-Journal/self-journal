// Database adapter - auto-detects which database to use based on environment

const useTurso = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

if (useTurso) {
  console.log('🚀 Using Turso (libSQL) for cloud deployment');

  // Re-export all Turso operations
  export * from './db-turso';

  // For backward compatibility, also export as default
  import turso from './db-turso';
  export default turso;

} else {
  console.log('💾 Using SQLite for local/self-hosted deployment');

  // Re-export all SQLite operations
  export * from './db';

  // For backward compatibility
  import db from './db';
  export default db;
}
