import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import { Toaster } from "@/components/ui/toaster";

/**
 * Layout component that controls the main structure of the page.
 * - Checks if the user is authenticated by calling `getCurrentUser`.
 * - If no user is found, it redirects to the login page.
 * - If the user is authenticated, it displays the main layout with sidebar, header, mobile navigation, and main content area.
 *
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The main content to display within the layout.
 *
 * @returns {JSX.Element} - Returns the main layout structure for authenticated users.
 */

export const dynamic = "force-dynamic";

const layout = async ({ children }: { children: React.ReactNode }) => {
  // Check for the current user's authentication status
  const currentUser = await getCurrentUser();

  // If no authenticated user is found, redirect to the login page
  if (!currentUser) return redirect("/sign-in");

  // Render the main layout with Sidebar, MobileNavigation, Header, and the provided child components
  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />

      <section className="flex flex-1 flex-col h-full">
        <MobileNavigation {...currentUser} />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <div className="main-content">{children}</div>
      </section>

      <Toaster />
    </main>
  );
};

export default layout;
