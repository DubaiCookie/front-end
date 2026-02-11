import clsx from "clsx";
import styles from "./Input.module.css";
import { useMemo, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { FieldSpec } from "@/types/user";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import InputItem from "./InputItem";

type InputFormProps<TName extends string> = {
  fields: FieldSpec<TName>[];
  onSubmit: (values: Record<TName, string>) => Promise<void> | void;
  submitLabel?: string;
};

type FormSubmitHandler = NonNullable<ComponentPropsWithoutRef<"form">["onSubmit"]>;

export default function InputForm<TName extends string>({
  fields,
  onSubmit,
  submitLabel = "제출",
}: InputFormProps<TName>) {
  const initialValues = useMemo(() => {
    return fields.reduce(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {} as Record<TName, string>,
    );
  }, [fields]);

  const [values, setValues] = useState<Record<TName, string>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<TName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();

    const nextErrors: Partial<Record<TName, string>> = {};

    for (const field of fields) {
      const value = values[field.name];
      const validationMessage = field.validate?.(value, values);
      if (validationMessage) {
        nextErrors[field.name] = validationMessage;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx(styles.root, 'flex-column')}>
      <LoadingSpinner isLoading={isSubmitting} />
      <form className={clsx(styles.form)} onSubmit={handleSubmit}>
        {fields.map((field) => (
          <InputItem
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(e) => {
              const nextValue = e.target.value;
              setValues((prev) => ({ ...prev, [field.name]: nextValue }));
              setErrors((prev) => ({ ...prev, [field.name]: undefined }));
            }}
          />
        ))}
        <Button
          type="submit"
          disabled={isSubmitting}
          title={isSubmitting ? "처리 중..." : submitLabel}
        />
      </form>
    </div>
  );
}
