"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite"
import { appwriteConfig } from "../appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



/**
 * Fetches a user document from the database by the user's email.
 * This function checks if a user already exists by querying for the email.
 * 
 * @param {string} email - The email of the user to search for.
 * @returns {Object|null} - Returns the user document if found, otherwise null.
 */
const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    // Query the database for a user document with a matching email field
    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );

    // Return the first document if found; otherwise, return null
    return result.total > 0 ? result.documents[0] : null;
};

/**
 * Logs an error message and rethrows the error for higher-level handling.
 * 
 * @param {unknown} error - The error object thrown.
 * @param {string} message - A descriptive message of where the error occurred.
 */
const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

/**
 * Sends a one-time password (OTP) to the user's email for account verification.
 * 
 * @param {Object} params - Parameters for sending OTP.
 * @param {string} params.email - The email address to which the OTP is sent.
 * @returns {string|null} - Returns the account ID if OTP is successfully sent.
 * @throws Will invoke handleError if OTP creation fails.
 */
export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        // Generate and send an OTP to the specified email
        const session = await account.createEmailToken(ID.unique(), email);

        // Return the unique user ID associated with the session
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

/**
 * Creates a new user account or retrieves an existing one.
 * - Checks if the user already exists by querying for the email.
 * - If the user does not exist, it creates a new account document in the database.
 * - Sends an OTP to verify the user's email.
 * 
 * @param {Object} params - The parameters for creating a new account.
 * @param {string} params.fullName - Full name of the user.
 * @param {string} params.email - Email address of the user.
 * @returns {Object} - Returns a JSON-serializable object containing the account ID.
 * @throws Will throw an error if OTP generation fails.
 */
export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
    // Check if a user already exists with the specified email
    const existingUser = await getUserByEmail(email);

    // Get the account ID by sending an OTP to the user's email
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");

    // If no existing user is found, create a new user document in the database
    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,           // Specifies the database
            appwriteConfig.usersCollectionId,     // Specifies the collection
            ID.unique(),                          // Generates a unique ID for the new document
            {
                fullName,
                email,
                avatar: avatarPlaceholderUrl,
                accountId,
            },
        );
    }

    // Return the account ID in a JSON-serializable format to simplify further processing
    return parseStringify({ accountId });
};

//API to verify OTP
export const verifySecret = async ({accountId, password} : {accountId:string; password:string}) => {
    try {
        // Retrieve the account service from the Appwrite client.
        const { account } = await createAdminClient()
        // Create a session for the account using the provided account ID and password.
        const session = await account.createSession(accountId, password);
        // Set a secure, HTTP-only cookie with the session secret to maintain the session.
        (await cookies()).set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        });
        // Return the session ID in JSON format for easy handling by the client.
        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        // Handle and log any errors that occur during OTP verification or session creation.
        handleError(error, "Failed to verify OTP");
    }
}


/**
 * Retrieves the current user's information from the database.
 * - First, it checks the session cookies to authenticate the user.
 * - Then, it fetches the user's account details using Appwrite's Account service.
 * - Finally, it queries the database for a user document that matches the user's account ID.
 *
 * @returns {Object|null} - Returns the user document if found, or null if not found or if an error occurs.
 * @throws - Logs any error encountered during the process.
 */
export const getCurrentUser = async () => {
    try {
        // Create a session client to retrieve the authenticated user's session information
        const { databases, account } = await createSessionClient();

        // Fetch the account details of the currently authenticated user
        const result = await account.get();

        // Query the database for the user document that matches the account ID
        const user = await databases.listDocuments(
            appwriteConfig.databaseId,          // The database ID
            appwriteConfig.usersCollectionId,    // The collection ID for users
            [Query.equal("accountId", result.$id)] // Query to match account ID
        );

        // Return null if no user document is found
        if (user.total <= 0) return null;

        // Parse and return the user document in a JSON-serializable format
        return parseStringify(user.documents[0]);
    } catch (error) {
        // Log the error encountered in the process
        console.log(error);
    }
};


/**
 * Signs out the currently authenticated user.
 * - Deletes the user's current session using the Appwrite Account service.
 * - Removes the "appwrite-session" cookie to clear the session on the client side.
 * - Redirects the user to the sign-in page after signing out.
 *
 * @returns {void} - This function does not return a value.
 * @throws - If an error occurs during sign-out, it logs the error and displays a failure message.
 */
export const signOutUser = async () => {
    const { account } = await createSessionClient();
  
    try {
      // Delete the current session for the authenticated user
      await account.deleteSession("current");
  
      // Remove the session cookie to ensure the user is fully signed out
      (await cookies()).delete("appwrite-session");
    } catch (error) {
      // Log any errors encountered during the sign-out process
      handleError(error, "Failed to sign out user");
    } finally {
      // Redirect the user to the sign-in page after attempting sign-out
      redirect("/sign-in");
    }
};


/**
 * Attempts to sign in a user using their email address by:
 * - Checking if the user exists in the database.
 * - Sending a one-time password (OTP) if the user exists.
 * - Returning the account ID or an error message if the user is not found.
 *
 * @param {Object} params - The parameters for the sign-in function.
 * @param {string} params.email - The email address of the user attempting to sign in.
 * @returns {Promise<Object>} - A promise that resolves with the account ID if the user exists, or an error if not found.
 * @throws - If any error occurs during the sign-in process, the error is logged and managed by `handleError`.
 */
export const signInUser = async ({ email }: { email: string }) => {
    try {
      // Check if a user with the given email exists in the database
      const existingUser = await getUserByEmail(email);
  
      // If the user exists, send an OTP to the email and return the user's account ID
      if (existingUser) {
        await sendEmailOTP({ email });
        return parseStringify({ accountId: existingUser.accountId });
      }
  
      // If the user does not exist, return an error message
      return parseStringify({ accountId: null, error: "User not found" });
    } catch (error) {
      // Handle any errors that occur during the sign-in process
      handleError(error, "Failed to sign in user");
    }
};  