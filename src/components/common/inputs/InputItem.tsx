import clsx from "clsx";
import styles from "./Input.module.css";
import type { ChangeEventHandler } from "react";
import type { FieldSpec } from "@/types/user";

type InputItemProps<TName extends string> = {
    field: FieldSpec<TName>;
    value: string;
    error?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
};

function toInputType(type: FieldSpec["type"]) {
    if (type === "password") {
        return "password";
    }
    return "text";
}

export default function InputItem<TName extends string>({
    field,
    value,
    error,
    onChange,
}: InputItemProps<TName>) {
    return (
        <label className={clsx(styles.field)}>
            <span className={clsx(styles.label)}>{field.label}</span>
            <input
                type={toInputType(field.type)}
                value={value}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required={field.required}
                className={clsx(styles.input)}
                onChange={onChange}
            />
            {error && <small className={clsx(styles.error)}>{error}</small>}
        </label>
    );
}
