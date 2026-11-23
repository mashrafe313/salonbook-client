
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing from environment variables`);
  }

  return value;
}

const mongoUri = requiredEnv("MONGODB_URI");
const dbName = requiredEnv("DB_NAME");
const authUrl = requiredEnv("BETTER_AUTH_URL");
const authSecret = requiredEnv("BETTER_AUTH_SECRET");

const globalForMongo = globalThis as typeof globalThis & {
  salonBookMongoClient?: MongoClient;
};

const mongoClient =
  globalForMongo.salonBookMongoClient ??
  new MongoClient(mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.salonBookMongoClient = mongoClient;
}

const db = mongoClient.db(dbName);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export const auth = betterAuth({
  appName: "SalonBook",

  baseURL: authUrl,
  secret: authSecret,

  trustedOrigins: [authUrl],

  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  user: {
    modelName: "users",

    additionalFields: {
  role: {
    type: "string",
    required: false,
    defaultValue: "customer",
    input: false,
  },
  isBlocked: {
    type: "boolean",
    required: false,
    defaultValue: false,
    input: false,
  },
 phoneNumber: {
  type: "string",
  required: false,
  input: true,
},
},
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  ...(socialProviders ? { socialProviders } : {}),

  plugins: [
    jwt(),
  ],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const password = ctx.body?.password;

      if (
        typeof password !== "string" ||
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password)
      ) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must contain at least 6 characters, one uppercase letter and one lowercase letter.",
        });
      }
    }),
  },
});
