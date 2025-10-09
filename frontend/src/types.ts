export type GeneratedCredential = {
  id?: string;
  username: string;
  password: string;
  issuedBy: string;
  issuedAt: string;
};

export type VerifiedCredential = {
  id: string;
  username: string;
  password: string;
  worker: string;
  issuedAt: string;
};

export type ResponseMessage = {
  error: boolean;
  text: string;
};
