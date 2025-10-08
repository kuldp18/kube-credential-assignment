export type Credential = {
  username: string;
  password: string;
  worker: string;
  createdAt?: Date;
};

export type ResponseMessage = {
  message: string;
  error: boolean;
  data?: object;
};
