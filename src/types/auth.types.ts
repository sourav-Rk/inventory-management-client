export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: "admin" | "staff";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
