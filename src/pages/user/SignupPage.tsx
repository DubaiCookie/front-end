import clsx from "clsx";
import styles from "./user.module.css";
import InputForm from "@/components/common/inputs/InputForm";
import { signup } from "@/api/auth.api";
import type { FieldSpec, SignupUser } from "@/types/user";
import { Link } from "react-router-dom";

const signupFields: FieldSpec<"userId" | "userName" | "password" | "passwordConfirm">[] = [
  {
    name: "userId",
    label: "ID",
    type: "userId",
    placeholder: "ID를 입력하세요.",
    autoComplete: "username",
    required: true,
    validate: (v) => (v.length > 0 ? null : "사용자 ID를 입력해주세요."),
  },
  {
    name: "userName",
    label: "이름",
    type: "userName",
    placeholder: "이름을 입력하세요.",
    autoComplete: "name",
    required: true,
    validate: (v) => (v.length > 0 ? null : "사용자 이름을 입력해주세요."),
  },
  {
    name: "password",
    label: "비밀번호",
    type: "password",
    placeholder: "비밀번호를 입력하세요.",
    autoComplete: "new-password",
    required: true,
    validate: (v) => {
      if (v.length === 0) {
        return "비밀번호를 입력해주세요.";
      }
      if (v.length < 8) {
        return "비밀번호는 8자 이상이어야 합니다.";
      }
      if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) {
        return "비밀번호는 영문과 숫자를 모두 포함해야 합니다.";
      }
      return null;
    },
  },
  {
    name: "passwordConfirm",
    label: "비밀번호 확인",
    type: "password",
    placeholder: "비밀번호를 다시 입력하세요.",
    autoComplete: "new-password",
    required: true,
    validate: (v, allValues) => {
      if (v.length === 0) {
        return "비밀번호 확인을 입력해주세요.";
      }
      if (v !== allValues.password) {
        return "비밀번호가 일치하지 않습니다.";
      }
      return null;
    },
  },
];

export default function SignupPage() {
  const handleSignup = async (values: SignupUser) => {
    await signup(values);
  };

  return (
    <div className={clsx("container", "flex-column")}>
      <div className={clsx(styles.block, "flex-column")}>
        <div className={clsx(styles.title, "page-title")}>회원가입</div>
        <InputForm fields={signupFields} onSubmit={handleSignup} submitLabel="회원가입" />
        <Link to="/login" className={clsx(styles.smallText)}>이미 회원이신가요?</Link>
      </div>
    </div>
  );
}
