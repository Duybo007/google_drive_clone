"use server";

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";

/**
 * Creates a session-based Appwrite client using session data from cookies.
 * This client is primarily used for accessing user-specific data and services.
 * 
 * @throws Will throw an error if no session cookie is found.
 * @returns {Object} An object containing initialized Account and Databases services.
 * 
 * Note: To protect user data, each client should be created per request, preventing
 * data leakage across sessions or users.
 */
export const createSessionClient = async () => {
  // Initialize the Appwrite client with endpoint and project details
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  // Retrieve session token from cookies to authenticate the client
  const session = (await cookies()).get("appwrite-session");

  // Throw an error if no session token is found
  if (!session || !session.value) throw new Error("No session");

  // Set the session token for the client to enable authenticated requests
  client.setSession(session.value);

  // Return initialized services with authenticated client, limited to Account and Databases
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

// Sharing the same connection requests can lead to security issues like exposing someone else’s data or session.
// Therefore, always create a new client connection for each request to keep data safe and secure.

/**
 * Creates an admin Appwrite client using the server's secret API key.
 * This client provides elevated privileges to access Appwrite's management features, 
 * such as handling storage, managing user accounts, databases, and avatars.
 * 
 * @returns {Object} An object containing initialized Account, Databases, Storage, and Avatars services.
 * 
 * Security Consideration: This client should be used with caution, as it has access to sensitive 
 * administrative operations. Avoid exposing this client or using it in client-side code.
 */
export const createAdminClient = async () => {
    // Initialize the Appwrite client with endpoint, project, and admin API key
    const client = new Client()
      .setEndpoint(appwriteConfig.endpointUrl)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.secretKey);

    // Return initialized services with admin-level access for Account, Databases, Storage, and Avatars
    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
      get storage() {
        return new Storage(client);
      },
      get avatars() {
        return new Avatars(client);
      },
    };
};
