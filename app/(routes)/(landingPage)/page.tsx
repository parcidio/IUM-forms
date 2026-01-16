import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink, LogIn, Video } from "lucide-react";
import Image from "next/image";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";


export default function Home() {
  return (
    <div className="w-full">
      <div className="hero-section w-full min-h-screen">
        <div className="w-full relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-full h-[200px] bg-gradient-to-r from-primary to-purple-500 rounded-full blur-3xl opacity-40 z-0" />
          <div className="h-[200px] h-[200px] md:h-[200px] lg:h-[200px] rounded-xl shadow-lg bg-transparent">
            <div className="relative w-full h-full rounded-md">
              <Image
                src="/images/IUM-logo.png"
                alt="IUM Logo"
                fill
                className="object-contain w-full h-full rounded-md"
              />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center py-10 max-w-4xl mx-auto">
       

          <div className="flex flex-col mt-5 items-center text-center">
            <h1 className="text-6xl font-black">
              <p className="mt-1">
                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent animate-sparkle">
                  IUM Forms
                </span>

              </p>
            </h1>
            <p className=" block text-lg mt-3 max-w-2xl mx-auto w-full font-medium text-black/70">
              Create beautiful forms and share them scholars.
            </p>
            <br />
            <div className="flex items-center gap-2">

              <Button className="h-12 text-base font-medium min-w-32" asChild>
                <LoginLink>
                
                    Login
                    <LogIn size="17px" />
              
                </LoginLink>
              </Button>
              <Button
                variant="outline"
                className="h-12  border-primary text-primary text-base font-medium min-w-32"
                asChild
              >
                <RegisterLink>
                  Create an account
                  <ExternalLink />
                </RegisterLink>
              </Button>
            </div>
            
          </div>
        </div>

      </div>
      <br />
      <br />
      <br />
    </div>
  );
}
