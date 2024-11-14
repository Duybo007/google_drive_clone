"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import { Button } from "./ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OptModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  //manage modal state
  const [isOpen, setIsOpen] = useState(true);
  //manage OTP
  const [password, setPassword] = useState("");
  //manage loading state
  const [isLoading, setIsLoading] = useState(false);

  //handle submit
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default button behavior to avoid page reload.
    e.preventDefault();

    // Set loading state to true to indicate process initiation (e.g., for showing a loading spinner).
    setIsLoading(true);

    try {
      // Call the API function to verify OTP with the provided account ID and password.
      const { sessionId } = await verifySecret({ accountId, password });

      // If OTP verification is successful and a session ID is returned, navigate to the home page.
      if (sessionId) router.push("/");
    } catch (error) {
      // Log any errors encountered during OTP verification.
      console.log("Failed to verify OTP", error);
    }

    // Reset loading state after the process is complete.
    setIsLoading(false);
  };

  //call API to resend OTP when OTP expires
  const handleResendOtp = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn&apos;t get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Click to resend code
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OptModal;
