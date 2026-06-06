import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

// In-memory store for courses
const coursesStore = new Map<number, Course>();
let idCounter = 0;

@Injectable()
export class CoursesService {
  private nextId(): number {
    return ++idCounter;
  }

  private nameExists(name: string, excludeId?: number): boolean {
    for (const course of coursesStore.values()) {
      if (
        course.name.toLowerCase() === name.toLowerCase() &&
        course.id !== excludeId
      )
        return true;
    }
    return false;
  }

  create(dto: CreateCourseDto): Course {
    if (this.nameExists(dto.name)) {
      throw new ConflictException(`Course "${dto.name}" already exists.`);
    }
    const id = this.nextId();
    const course = new Course({ id, ...dto, students: [] });
    coursesStore.set(id, course);
    return course;
  }

  findAll(): Course[] {
    return [...coursesStore.values()];
  }

  findOne(id: number): Course {
    const course = coursesStore.get(id);
    if (!course) throw new NotFoundException(`Course #${id} not found.`);
    return course;
  }

  update(id: number, dto: UpdateCourseDto): Course {
    const course = this.findOne(id);

    if (dto.name && this.nameExists(dto.name, id)) {
      throw new ConflictException(`Course "${dto.name}" already exists.`);
    }

    const updated = new Course({ ...course, ...dto });
    coursesStore.set(id, updated);
    return updated;
  }

  remove(id: number): { message: string } {
    this.findOne(id);
    coursesStore.delete(id);
    return { message: `Course #${id} has been removed.` };
  }

  /** Add a student (userId) to this course */
  enrollStudent(courseId: number, userId: number): Course {
    const course = this.findOne(courseId);
    if (!course.students.includes(userId)) {
      course.students.push(userId);
      coursesStore.set(courseId, course);
    }
    return course;
  }

  /** Remove a student (userId) from this course */
  removeStudent(courseId: number, userId: number): Course {
    const course = this.findOne(courseId);
    course.students = course.students.filter((s) => s !== userId);
    coursesStore.set(courseId, course);
    return course;
  }
}
