export type FieldType = 'userId' | 'password';

export type FieldSpec<TName extends string = string> = {
    name: TName;
    label: string;
    type: FieldType;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;

    // 검증: 통과하면 null, 실패하면 에러메시지
    validate?: (value: string, allValues: Record<string, string>) => string | null;
};

export interface LoginUser {
    userId: string;
    password: string;
}

export interface SignupUser extends LoginUser {
    passwordConfirm: string;
}

export interface RequestUser {
    username: string;
    password: string;
}
