import { cva, type VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-[color:var(--chrome-focus)] bg-accent text-[color:var(--accent-contrast)] shadow-[0_12px_28px_color-mix(in_srgb,var(--accent)_28%,transparent)] hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "border-border bg-[color:var(--chrome-soft)] text-foreground hover:-translate-y-0.5 hover:bg-[color:var(--chrome-hover)]",
        ghost:
          "border-transparent bg-transparent text-foreground-soft hover:bg-[color:var(--chrome-soft)] hover:text-foreground",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ className, variant, size }))}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-[color:var(--chrome-focus)] focus-visible:bg-[color:var(--chrome-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-36 w-full rounded-[22px] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4 py-3.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-[color:var(--chrome-focus)] focus-visible:bg-[color:var(--chrome-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono-label">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Panel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("surface p-4 md:p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function StatusPill({
  tone = "default",
  children,
}: {
  tone?: "default" | "success" | "warning";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]",
        tone === "success" &&
          "border-[color:var(--success-border)] bg-[color:var(--success-bg)] text-[color:var(--success-text)]",
        tone === "warning" &&
          "border-[color:var(--warning-border)] bg-[color:var(--warning-bg)] text-[color:var(--warning-text)]",
        tone === "default" &&
          "border-border bg-[color:var(--chrome-soft)] text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 rounded border border-[color:var(--border-strong)] bg-transparent accent-accent",
        className,
      )}
      {...props}
    />
  );
}
