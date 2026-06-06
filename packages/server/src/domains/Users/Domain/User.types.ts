export interface IUser {
  id?: number;
  mail: string;
  name: string;
  password?: string;
  renewPassword?: boolean;
  userImage?: string;
  ownerId?: number;
  companyLogo?: string;
  companyName?: string;
  rol?: string;
}
