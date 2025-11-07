import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/security/encryption";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma ?? new PrismaClient();

client.$use(async (params, next) => {
  if (params.model === "Account" && params.action === "create") {
    const data = params.args.data;
    if (data.refresh_token) data.refresh_token = encrypt(data.refresh_token);
    if (data.access_token) data.access_token = encrypt(data.access_token);
  }
  if (params.model === "Account" && params.action === "update") {
    const data = params.args.data;
    if (data.refresh_token) data.refresh_token = encrypt(data.refresh_token);
    if (data.access_token) data.access_token = encrypt(data.access_token);
  }
  if (params.model === "Account" && params.action === "upsert") {
    const create = params.args.create;
    const update = params.args.update;
    if (create.refresh_token) create.refresh_token = encrypt(create.refresh_token);
    if (create.access_token) create.access_token = encrypt(create.access_token);
    if (update.refresh_token) update.refresh_token = encrypt(update.refresh_token);
    if (update.access_token) update.access_token = encrypt(update.access_token);
  }
  const result = await next(params);
  if (params.model === "Account") {
    const decryptField = (record: any) => {
      if (!record) return record;
      if (record.refresh_token) record.refresh_token = decrypt(record.refresh_token);
      if (record.access_token) record.access_token = decrypt(record.access_token);
      return record;
    };
    if (Array.isArray(result)) {
      return result.map(decryptField);
    }
    return decryptField(result);
  }
  return result;
});

export const prisma = client;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
