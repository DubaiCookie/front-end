import clsx from "clsx";
import styles from "./user.module.css";
import { useState } from "react";
import InputForm from "@/components/common/inputs/InputForm";
import { signup } from "@/api/auth.api";
import type { FieldSpec, SignupUser } from "@/types/user";
import { Link, useNavigate } from "react-router-dom";
import Modal from "@/components/common/Modal";

const signupFields: FieldSpec<"userId" | "password" | "passwordConfirm">[] = [
  {
    name: "userId",
    label: "ID",
    type: "userId",
    placeholder: "ID를 입력하세요.",
    autoComplete: "userId",
    required: true,
    validate: (v) => {
      if (v.length === 0) {
        return "사용자 ID를 입력해주세요.";
      }
      if (v.length < 5) {
        return "사용자 ID는 5자 이상이어야 합니다.";
      }
      if (!/^[A-Za-z0-9]+$/.test(v)) {
        return "사용자 ID는 영문과 숫자만 사용할 수 있습니다.";
      }
      return null;
    },
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
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(v)) {
        return "비밀번호에 한글은 사용할 수 없습니다.";
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
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSignup = async (values: SignupUser) => {
    const signupPayload = {
      username: values.userId,
      password: values.password,
    };
    await signup(signupPayload);
    setIsSuccessModalOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isSuccessModalOpen}
        title="회원가입 완료"
        content="회원가입이 성공적으로 완료되었습니다."
        buttonTitle="확인"
        onButtonClick={() => {
          setIsSuccessModalOpen(false);
          navigate("/login");
        }}
      />
      <div className={clsx("container", "flex-column")}>
        <div className={clsx(styles.block, "flex-column")}>
          <div className={clsx(styles.title, "page-title")}>sign up</div>
          <InputForm fields={signupFields} onSubmit={handleSignup} submitLabel="회원가입" />
          <Link to="/login" className={clsx(styles.smallText)}>이미 회원이신가요?</Link>
        </div>
      </div>
    </>
  );
}
