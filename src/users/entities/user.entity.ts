export class User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  password: string;
  email: string;        // must be unique
  courses: number[];    // array of course IDs
  avatarPath?: string;  // relative path of uploaded profile image

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
