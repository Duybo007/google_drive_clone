import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//When handling large payloads in server actions, stringifying and parsing the data helps manage the payload size, ensures data consistency, and simplifies processing
export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

/**
 * Determines the file type based on the file extension and categorizes it as
 * "document", "image", "video", "audio", or "other" if it doesn't match any known category.
 *
 * @param {string} fileName - The name of the file, including its extension.
 * @returns {Object} - Returns an object containing:
 *    - `type` {string}: The category of the file (e.g., "document", "image", "video", "audio", or "other").
 *    - `extension` {string}: The lowercase file extension (e.g., "pdf", "jpg"), or an empty string if no extension is found.
 *
 * @example
 * // Returns { type: "image", extension: "jpg" }
 * getFileType("photo.jpg");
 *
 * @example
 * // Returns { type: "document", extension: "pdf" }
 * getFileType("file.pdf");
 *
 * @example
 * // Returns { type: "other", extension: "" }
 * getFileType("no_extension_file");
 */
export const getFileType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase(); // Extract the file extension

  if (!extension) return { type: "other", extension: "" }; // Return "other" type if no extension

  // Define lists of extensions for each file category
  const documentExtensions = [
    "pdf", "doc", "docx", "txt", "xls", "xlsx", "csv", "rtf", "ods", "ppt", "odp", "md",
    "html", "htm", "epub", "pages", "fig", "psd", "ai", "indd", "xd", "sketch", "afdesign",
    "afphoto"
  ];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm"];
  const audioExtensions = ["mp3", "wav", "ogg", "flac"];

  // Determine the file type based on the extension
  if (documentExtensions.includes(extension))
    return { type: "document", extension };
  if (imageExtensions.includes(extension))
    return { type: "image", extension };
  if (videoExtensions.includes(extension))
    return { type: "video", extension };
  if (audioExtensions.includes(extension))
    return { type: "audio", extension };

  return { type: "other", extension }; // Return "other" if no match
};


/**
 * Converts a `File` object to a temporary URL that can be used for displaying
 * the file in a browser (e.g., for previewing images or videos).
 *
 * @param {File} file - The file to convert to a URL.
 * @returns {string} - A temporary object URL that points to the file's data.
 *
 * @example
 * // Returns a blob URL such as "blob:http://localhost:3000/abc123..."
 * const imageUrl = convertFileToUrl(selectedFile);
 *
 * // To release the URL after use
 * URL.revokeObjectURL(imageUrl);
 */
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);



/**
 * Returns the appropriate icon URL based on a file's extension or type.
 *
 * This function first checks the file extension to identify specific formats
 * (e.g., "pdf" or "doc"). If the extension is not recognized, it uses the 
 * general file type (image, document, video, audio) as a fallback.
 *
 * @param {string | undefined} extension - The file extension (e.g., "pdf", "mp3").
 * @param {FileType | string} type - The general type of the file, such as "image", "document", "video", or "audio".
 * @returns {string} - The URL path to the corresponding icon asset.
 *
 * @example
 * // Returns "/assets/icons/file-pdf.svg" for PDF files
 * const pdfIcon = getFileIcon("pdf", "document");
 *
 * // Returns "/assets/icons/file-image.svg" for an unknown image type
 * const imageIcon = getFileIcon(undefined, "image");
 */
export const getFileIcon = (
  extension: string | undefined,
  type: FileType | string,
) => {
  switch (extension) {
    // Document
    case "pdf":
      return "/assets/icons/file-pdf.svg";
    case "doc":
      return "/assets/icons/file-doc.svg";
    case "docx":
      return "/assets/icons/file-docx.svg";
    case "csv":
      return "/assets/icons/file-csv.svg";
    case "txt":
      return "/assets/icons/file-txt.svg";
    case "xls":
    case "xlsx":
      return "/assets/icons/file-document.svg";
    // Image
    case "svg":
      return "/assets/icons/file-image.svg";
    // Video
    case "mkv":
    case "mov":
    case "avi":
    case "wmv":
    case "mp4":
    case "flv":
    case "webm":
    case "m4v":
    case "3gp":
      return "/assets/icons/file-video.svg";
    // Audio
    case "mp3":
    case "mpeg":
    case "wav":
    case "aac":
    case "flac":
    case "ogg":
    case "wma":
    case "m4a":
    case "aiff":
    case "alac":
      return "/assets/icons/file-audio.svg";

    default:
      switch (type) {
        case "image":
          return "/assets/icons/file-image.svg";
        case "document":
          return "/assets/icons/file-document.svg";
        case "video":
          return "/assets/icons/file-video.svg";
        case "audio":
          return "/assets/icons/file-audio.svg";
        default:
          return "/assets/icons/file-other.svg";
      }
  }
};



/**
 * APPWRITE URL UTILS
 *
 * Utility functions to construct URLs for accessing files stored in Appwrite.
 */

/**
 * Constructs a URL to view a file in Appwrite storage.
 *
 * @param {string} bucketFileId - The unique ID of the file in the Appwrite storage bucket.
 * @returns {string} - The URL to view the file.
 *
 * @example
 * const fileUrl = constructFileUrl("file123");
 * console.log(fileUrl); // Outputs the URL to view the file.
 */
export const constructFileUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};

/**
 * Constructs a URL to download a file from Appwrite storage.
 *
 * @param {string} bucketFileId - The unique ID of the file in the Appwrite storage bucket.
 * @returns {string} - The URL to download the file.
 *
 * @example
 * const downloadUrl = constructDownloadUrl("file123");
 * console.log(downloadUrl); // Outputs the URL to download the file.
 */
export const constructDownloadUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};

/**
 * DASHBOARD UTILS
 *
 * Utility functions to help display usage statistics and categorize file types in the dashboard.
 */

/**
 * Creates a usage summary based on the total space used by each file type.
 *
 * @param {Object} totalSpace - An object containing usage information for each file type.
 * @param {Object} totalSpace.document - Usage information for documents.
 * @param {Object} totalSpace.image - Usage information for images.
 * @param {Object} totalSpace.video - Usage information for videos.
 * @param {Object} totalSpace.audio - Usage information for audio files.
 * @param {Object} totalSpace.other - Usage information for other file types.
 * @returns {Array<Object>} - An array of objects, each representing a file category with its size, latest date, icon, and URL.
 *
 * @example
 * const usageSummary = getUsageSummary(totalSpace);
 * console.log(usageSummary); // Outputs an array of usage summaries for each file type.
 */
export const getUsageSummary = (totalSpace: any) => {
  return [
    {
      title: "Documents",
      size: totalSpace.document.size,
      latestDate: totalSpace.document.latestDate,
      icon: "/assets/icons/file-document-light.svg",
      url: "/documents",
    },
    {
      title: "Images",
      size: totalSpace.image.size,
      latestDate: totalSpace.image.latestDate,
      icon: "/assets/icons/file-image-light.svg",
      url: "/images",
    },
    {
      title: "Media",
      size: totalSpace.video.size + totalSpace.audio.size,
      latestDate:
        totalSpace.video.latestDate > totalSpace.audio.latestDate
          ? totalSpace.video.latestDate
          : totalSpace.audio.latestDate,
      icon: "/assets/icons/file-video-light.svg",
      url: "/media",
    },
    {
      title: "Others",
      size: totalSpace.other.size,
      latestDate: totalSpace.other.latestDate,
      icon: "/assets/icons/file-other-light.svg",
      url: "/others",
    },
  ];
};

/**
 * Returns an array of file types based on the specified category.
 *
 * @param {string} type - The type/category of files (e.g., "documents", "images", "media", "others").
 * @returns {Array<string>} - An array of file type strings.
 *
 * @example
 * const fileTypes = getFileTypesParams("media");
 * console.log(fileTypes); // Outputs: ["video", "audio"]
 */
export const getFileTypesParams = (type: string) => {
  switch (type) {
    case "documents":
      return ["document"];
    case "images":
      return ["image"];
    case "media":
      return ["video", "audio"];
    case "others":
      return ["other"];
    default:
      return ["document"];
  }
};


// Converts file size from bytes to a human-readable format (Bytes, KB, MB, GB).
// Optionally, allows for specifying the number of decimal places for precision.
export const convertFileSize = (sizeInBytes: number, digits?: number) => {
  // If the size is less than 1 KB, display in Bytes
  if (sizeInBytes < 1024) {
    return sizeInBytes + " Bytes";
  } 
  // If the size is less than 1 MB, convert to KB and display with specified precision
  else if (sizeInBytes < 1024 * 1024) {
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB.toFixed(digits || 1) + " KB";
  } 
  // If the size is less than 1 GB, convert to MB and display with specified precision
  else if (sizeInBytes < 1024 * 1024 * 1024) {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(digits || 1) + " MB";
  } 
  // For sizes 1 GB or more, convert to GB and display with specified precision
  else {
    const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
    return sizeInGB.toFixed(digits || 1) + " GB";
  }
};


export const formatDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return "—";

  const date = new Date(isoString);

  // Get hours and adjust for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;

  // Format the time and date parts
  const time = `${hours}:${minutes.toString().padStart(2, "0")}${period}`;
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  return `${time}, ${day} ${month}`;
};

export const calculatePercentage = (sizeInBytes: number) => {
  const totalSizeInBytes = 2 * 1024 * 1024 * 1024; // 2GB in bytes
  const percentage = (sizeInBytes / totalSizeInBytes) * 100;
  return Number(percentage.toFixed(2));
};