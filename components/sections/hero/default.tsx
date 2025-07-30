import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import Github from "../../logos/github";
import { Badge } from "../../ui/badge";
import { Button, type ButtonProps } from "../../ui/button";
import Glow from "../../ui/glow";
import { Mockup, MockupFrame } from "../../ui/mockup";
import Screenshot from "../../ui/screenshot";
import { Section } from "../../ui/section";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Give your big idea the design it deserves",
  description = "Professionally designed blocks and templates built with React, Shadcn/ui and Tailwind that will help your product stand out.",
  mockup = (
    <Screenshot
      srcLight="/app-light.png"
      srcDark="/app-dark.png"
      alt="Launch UI app screenshot"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">
        New version of Launch UI is out!
      </span>
      <a href="https://www.launchuicomponents.com/" className="flex items-center gap-1">
        Get started
        <ArrowRightIcon className="size-3" />
      </a>
    </Badge>
  ),
  buttons = [
    {
      href: "https://www.launchuicomponents.com/",
      text: "Get Started",
      variant: "default",
    },
    {
      href: "https://www.launchuicomponents.com/",
      text: "Github",
      variant: "glow",
      icon: <Github className="mr-2 size-4" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "overflow-hidden pb-0 sm:pb-0 md:pb-0 relative min-h-[60vh] flex items-center",
        className,
      )}
    >
      {/* Background gradient and glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <Glow variant="top" className="opacity-10" />
      
      <div className="max-w-container relative z-10 mx-auto flex flex-col gap-6 py-12 sm:gap-8">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
          {badge !== false && (
            <div className="animate-appear opacity-0 delay-75">
              {badge}
            </div>
          )}
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="animate-appear text-2xl font-bold text-foreground sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
              {title}
            </h1>
            
            <p className="animate-appear text-muted-foreground text-sm sm:text-base md:text-lg opacity-0 delay-100 max-w-2xl mx-auto">
              {description}
            </p>
          </div>
          
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear flex flex-col sm:flex-row justify-center gap-3 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "default"}
                  size="lg"
                  className="group transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <a href={button.href}>
                    {button.icon}
                    {button.text}
                    {button.iconRight || <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {mockup !== false && (
          <div className="relative w-full pt-6">
            <MockupFrame
              className="animate-appear opacity-0 delay-700"
              size="small"
            >
              <Mockup
                type="responsive"
                className="bg-background/90 w-full rounded-xl border-0 shadow-2xl"
              >
                {mockup}
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
