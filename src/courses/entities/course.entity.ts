export class Course {
  id: number;
  name: string;
  grade: string;
  students: number[];   // array of user IDs

  constructor(partial: Partial<Course>) {
    Object.assign(this, partial);
  }
}
