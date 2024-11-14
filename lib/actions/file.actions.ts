"use server"

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

const createQueries = (
  currentUser: Models.Document, 
  types : string[], 
  searchText: string,
  sort: string,
  limit?: number) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ])
  ]

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
}

/**
 * Uploads a file to Appwrite storage and stores metadata in the database.
 *
 * This function takes a file, uploads it to a specified Appwrite storage bucket, 
 * and creates a document in the database with metadata about the file, 
 * including file type, name, URL, and owner details. If the document creation fails, 
 * the uploaded file in storage is deleted to ensure data consistency.
 *
 * @param {UploadFileProps} props - The file upload parameters.
 * @param {File} props.file - The file to be uploaded.
 * @param {string} props.ownerId - The ID of the file's owner.
 * @param {string} props.accountId - The ID of the account uploading the file.
 * @param {string} props.path - The path to revalidate after file upload.
 * @returns {Promise<Object | void>} - Returns the created file document on success, or void on failure.
 *
 * @throws {Error} If the file upload or document creation fails.
 *
 * @example
 * // Usage example:
 * const newFile = await uploadFile({
 *   file: myFile,
 *   ownerId: "user123",
 *   accountId: "acc123",
 *   path: "/my-files",
 * });
 * console.log(newFile);
 */
export const uploadFile = async ({
    file,
    ownerId,
    accountId,
    path,
  }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();
  
    try {
      // Convert file to InputFile format for Appwrite storage
      const inputFile = InputFile.fromBuffer(file, file.name);

      // Upload file to storage
      const bucketFile = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        file,
      );

      const fileDocument = {
        type: getFileType(bucketFile.name).type,
        name: bucketFile.name,
        url: constructFileUrl(bucketFile.$id),
        extension: getFileType(bucketFile.name).extension,
        size: bucketFile.sizeOriginal,
        owner: ownerId,
        accountId,
        users: [],
        bucketFileId: bucketFile.$id,
      };
  
      // Save file metadata in the database
      const newFile = await databases
        .createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          ID.unique(),
          fileDocument,
        )
        .catch(async (error: unknown) => {
          // Delete file from storage if document creation fails
          await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
          handleError(error, "Failed to create file document");
        });
  
      // Revalidate the specified path for data consistency
      revalidatePath(path);
      return parseStringify(newFile);    
    } catch (error) {
      handleError(error, "Failed to upload file");
    }
};

export const getFiles = async ({ 
  types = [], searchText = "",
  sort = "$createdAt-desc",
  limit
} : GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser()

    if(!currentUser) throw new Error("User not found")

    const queries = createQueries(currentUser, types, searchText, sort, limit)

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );
    console.log({files})
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files")
  }
}

export const renameFile = async ({fileId, name, extension, path}: RenameFileProps) =>{
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
}

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}