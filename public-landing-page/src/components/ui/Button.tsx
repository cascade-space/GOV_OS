"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "orange" | "green" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Button({
    children,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        orange: "btn-orange",
        green: "btn-green",
        danger: "btn-danger",
        ghost: "btn-ghost",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={cn(variants[variant], sizes[size], (disabled || loading) && "opacity-60 cursor-not-allowed", className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}
