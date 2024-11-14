import React from "react";
import Image from "next/image";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center lg:flex xl:w-2/5 bg-brand p-10">
        <div className="flex flex-col justify-center max-h-[800px] max-w-[430px] space-y-12">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto"
          />

          <div className="space-y-5 text-white">
            <h1 className="h1">Manage your files the best way</h1>
            <p className="body-1">You can store all your documents here.</p>
          </div>

          <Image
            src="/assets/images/files.png"
            alt="files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 "
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="lg:hidden mb:16">
          <Image
            src="/assets/icons/logo-brand-full.svg"
            alt="files"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:[250px]"
          />
        </div>
        {children}
      </section>
    </div>
  );
};

export default layout;
