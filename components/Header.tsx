import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

/**
 * Header component for the application layout.
 * - Displays the search bar, file uploader, and a sign-out button.
 * - The sign-out button triggers a form action to handle user logout on the server side.
 *
 * @returns {JSX.Element} - The Header component structure.
 */
const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      {/* Search component for user input */}
      <Search />

      <div className="header-wrapper">
        {/* File uploader component for user uploads */}
        <FileUploader ownerId={userId} accountId={accountId} />

        {/* 
            Form with a server action for signing out.
            - When the form is submitted, it triggers the `signOutUser` function on the server.
            - The "use server" directive in the action function enables server-side behavior within the client-side component.
          */}
        <form
          action={async () => {
            "use server"; // Enables server-side execution of `signOutUser` within this client-side form action

            await signOutUser(); // Calls the server-side function to log out the user and redirect to the sign-in page
          }}
        >
          <Button className="sign-out-button" type="submit">
            {/* Sign-out icon */}
            <Image
              src="/assets/icons/logout.svg"
              alt="logout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
