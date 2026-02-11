import clsx from "clsx"
import styles from "./Button.module.css"
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    title: string;
}

export default function Button ({ title, className, ...buttonProps }: ButtonProps) {
    return (
        <button className={clsx(styles.button, className)} {...buttonProps}>
            {title}
        </button>
    );
}
