import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { ImAppleinc, ImSpotify, ImGithub } from "react-icons/im";
import { CgSpinner } from "react-icons/cg";
import Link from "next/link";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  href?: string;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "transparent"
    | "github"
    | "white"
    | "navigator";
  loading?: boolean;
  size?: "small" | "medium" | "large";
  icon?: ReactNode;
  className?: string;
  mobileCol?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      size = "medium",
      variant = "primary",
      href,
      icon,
      loading,
      className,
      mobileCol,
      ...props
    },
    ref
  ) => {
    const classes = twMerge(
      "whitespace-nowrap flex items-center justify-center gap-1.5 rounded-lg transition-all duration-300 w-fit",
      "disabled:opacity-50 border-2 border-transparent",
      variant === "primary" &&
        "bg-indigo-600 text-indigo-100 hover:bg-indigo-700 active:border-indigo-500",
      variant === "secondary" &&
        " bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:border-zinc-600",
      variant === "transparent" &&
        "bg-black/10 text-inherit opacity-75 hover:opacity-100",
      variant === "danger" &&
        "bg-red-600 text-white hover:bg-red-800 active:border-red-600",
      variant === "github" &&
        "bg-apple-500 hover:bg-apple-700 active:border-apple-500 text-apple-50",
      variant === "white" &&
        "bg-zinc-50 text-zinc-950 hover:bg-zinc-300 active:border-zinc-50",
      size === "small" && "text-sm px-2.5 py-1",
      size === "medium" && "px-4 py-1.5",
      size === "large" && "px-5 py-3",
      mobileCol && "flex-col-reverse md:flex-row gap-1",
      variant === "navigator" &&
        "bg-transparent rounded-full active:bg-zinc-800/60 hover:bg-zinc-800/40 p-2",
      className
    );

    const elementContent = (
      <>
        {loading && (
          <span className="flex animate-spin text-xl">
            <CgSpinner />
          </span>
        )}
        {variant === "github" && <ImGithub className="text-lg" />}
        {children}
        {icon && <span className="flex text-xl">{icon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {elementContent}
        </Link>
      );
    }

    return (
      <button
        disabled={loading}
        type="button"
        {...props}
        ref={ref}
        className={classes}
      >
        {elementContent}
      </button>
    );
  }
);

Button.displayName = "xd";

export { Button };
