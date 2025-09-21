export interface RequestBody {
  [key: string]: any;
}

export interface ResponseData {
  success: boolean;
  message?: string;
  data?: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}