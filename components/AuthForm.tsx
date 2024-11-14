"use client";

import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OptModal from "./OPTModal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  //Define your form.
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  /**
   * Handles form submission for sign-up or sign-in, depending on the `type` value.
   * - If `type` is "sign-up," creates a new account.
   * - If `type` is "sign-in," attempts to sign in the user.
   *
   * @param {Object} values - The form values derived from the form schema.
   * @param {string} values.fullName - The full name of the user (only required for sign-up).
   * @param {string} values.email - The email address of the user, used for both sign-up and sign-in.
   *
   * @returns {Promise<void>} - Returns nothing, but sets the account ID on success or displays an error message on failure.
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Indicate that the form submission is in progress
    setErrorMessage(""); // Reset any previous error message

    try {
      // Perform account creation or sign-in based on the `type`
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "", // Empty string when logging in
              email: values.email,
            })
          : await signInUser({ email: values.email });

      setAccountId(user.accountId); // Store the account ID if the operation is successful
    } catch (error) {
      console.log("*********", error); // Log the error for debugging
      if (type === "sign-up") {
        setErrorMessage("Failed to create account. Please try again."); // Display a user-friendly error message
      } else {
        setErrorMessage("Failed to sign in. Please try again later.");
      }
    } finally {
      setIsLoading(false); // Reset loading state after submission is complete
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>

          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className="shad-input"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                  </div>

                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="shad-input"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                </div>

                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 text-brand font-medium"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>

      {/* OPT modal */}
      {accountId && (
        <OptModal accountId={accountId} email={form.getValues("email")} />
      )}
    </>
  );
};

export default AuthForm;
