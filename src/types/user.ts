export type FieldType = 'email' | 'password' | 'text';

export type FieldSpec<TName extends string = string> = {
    name: TName;
    label: string;
    type: FieldType;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    validate?: (value: string, allValues: Record<string, string>) => string | null;
};

export interface LoginFormValues {
    email: string;
    password: string;
}

export interface SignupFormValues {
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface User {
    userId: number;
    email: string;
    nickname: string;
}

export interface RidePhotoRequest {
    attractionImageId: number;
    imageUrl: string;
    rideDate: string;
    attractionName: string;
}

export interface RidePhoto {
    ridePhotoId: number;
    userId: number;
    attractionImageId: number;
    imageUrl: string;
    rideDate: string;
    attractionName: string;
}
