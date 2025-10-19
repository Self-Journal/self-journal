// Database operations - now using Prisma ORM
// This file re-exports all operations from db-prisma.ts for backward compatibility

export * from './db-prisma';
export { default } from './prisma';
export { prisma } from './prisma';
