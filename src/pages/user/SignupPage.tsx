import clsx from "clsx";
import styles from "./user.module.css";
import { useState } from "react";
import axios from "axios";
import InputForm from "@/components/common/inputs/InputForm";
import { signup } from "@/api/auth.api";
import type { FieldSpec, SignupFormValues } from "@/types/user";
import { Link, useNavigate } from "react-router-dom";
import Modal from "@/components/common/modals/Modal";

const signupFields: FieldSpec<"email" | "nickname" | "password" | "passwordConfirm">[] = [
  {
    name: "email",
    label: "이메일",
    type: "email",
    placeholder: "이메일을 입력하세요.",
    autoComplete: "email",
    required: true,
    validate: (v) => {
      if (v.length === 0) return "이메일을 입력해주세요.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "올바른 이메일 형식을 입력해주세요.";
      return null;
    },
  },
  {
    name: "nickname",
    label: "닉네임",
    type: "text",
    placeholder: "닉네임을 입력하세요.",
    autoComplete: "nickname",
    required: true,
    validate: (v) => {
      if (v.length === 0) return "닉네임을 입력해주세요.";
      if (v.length < 2) return "닉네임은 2자 이상이어야 합니다.";
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
      if (v.length === 0) return "비밀번호를 입력해주세요.";
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(v)) return "비밀번호에 한글은 사용할 수 없습니다.";
      if (v.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
      if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "비밀번호는 영문과 숫자를 모두 포함해야 합니다.";
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
      if (v.length === 0) return "비밀번호 확인을 입력해주세요.";
      if (v !== allValues.password) return "비밀번호가 일치하지 않습니다.";
      return null;
    },
  },
];

type ErrorModalState = { open: boolean; title: string; content: string };

const CLOSED_MODAL: ErrorModalState = { open: false, title: "", content: "" };

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>(CLOSED_MODAL);

  const handleSignup = async (values: SignupFormValues) => {
    try {
      await signup({
        email: values.email,
        password: values.password,
        nickname: values.nickname,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const code: string = error.response?.data?.code ?? "";

        if (status === 409) {
          if (code === "EMAIL_ALREADY_EXISTS") {
            setErrorModal({ open: true, title: "회원가입 실패", content: "이미 사용 중인 이메일입니다." });
          } else if (code === "NICKNAME_ALREADY_EXISTS") {
            setErrorModal({ open: true, title: "회원가입 실패", content: "이미 사용 중인 닉네임입니다." });
          } else {
            setErrorModal({ open: true, title: "회원가입 실패", content: "이미 사용 중인 정보입니다." });
          }
          return;
        }

        if (status === 400) {
          if (code === "INVALID_EMAIL_FORMAT") {
            setErrorModal({ open: true, title: "회원가입 실패", content: "이메일 형식이 올바르지 않습니다." });
          } else if (code === "PASSWORD_TOO_SHORT") {
            setErrorModal({ open: true, title: "회원가입 실패", content: "비밀번호는 8자 이상이어야 합니다." });
          } else {
            setErrorModal({ open: true, title: "회원가입 실패", content: "입력 정보를 확인해주세요." });
          }
          return;
        }

        setErrorModal({ open: true, title: "오류", content: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
        return;
      }
      throw error;
    }
  };

  return (
    <>
      <Modal
        isOpen={errorModal.open}
        title={errorModal.title}
        content={errorModal.content}
        buttonTitle="확인"
        onClose={() => setErrorModal(CLOSED_MODAL)}
        onButtonClick={() => setErrorModal(CLOSED_MODAL)}
      />
      <Modal
        isOpen={isSuccessModalOpen}
        title="회원가입 완료"
        content="회원가입이 성공적으로 완료되었습니다."
        buttonTitle="확인"
        onClose={() => setIsSuccessModalOpen(false)}
        onButtonClick={() => {
          setIsSuccessModalOpen(false);
          navigate("/login");
        }}
      />
      <div className={clsx("container", "flex-column")}>
        <div className={clsx(styles.block, "flex-column")}>
          <div className={clsx(styles.title, "page-title")}>Sign up</div>
          <InputForm fields={signupFields} onSubmit={handleSignup} submitLabel="회원가입" />
          <Link to="/login" className={clsx(styles.smallText)}>이미 회원이신가요?</Link>
        </div>
      </div>
    </>
  );
}
