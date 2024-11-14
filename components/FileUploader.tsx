"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { useToast } from "@/hooks/use-toast";
import { MAX_FILE_SIZE } from "@/constants";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const { toast } = useToast();
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);

  // Callback function for handling file drop events
  
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles); // Update the files state with the dropped files

      // Process each file asynchronously
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Check if file size exceeds the maximum limit
        if (file.size > MAX_FILE_SIZE) {
          // If the file is too large, remove it from the files list
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name)
          );

          // Show a toast message indicating the file is too large
          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast", // Custom styling for error toast
          });
        }

        // Upload the file and handle success/failure
        return uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            if (uploadedFile) {
              // If upload is successful, remove the file from the list of files being uploaded
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name)
              );
            }
          }
        );
      });
      

      // Wait for all upload promises to complete
      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path] // Dependencies for the onDrop callback (ownerId, accountId, path)
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation();

    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </Button>

      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      alt="loader"
                      width={80}
                      height={26}
                    />
                  </div>
                </div>
                <Image
                  src="/assets/icons/remove.svg"
                  alt="remove"
                  width={24}
                  height={24}
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
