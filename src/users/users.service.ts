import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AbstractLogger,
  APP_CONFIG,
  USERS_STORE,
  USER_LOGGER,
} from './providers/custom-providers';

@Injectable()
export class UsersService {
  constructor(
    // ── useFactory ──────────────────────────────────────────────────────────
    // The in-memory store is created by a factory function in the module.
    // This gives us a single shared Map instance across the whole application.
    @Inject(USERS_STORE) private readonly store: Map<number, User>,

    // ── useClass ─────────────────────────────────────────────────────────────
    // We inject an AbstractLogger; the concrete class (DevLogger / ProdLogger)
    // is decided at module registration time — classic useClass swap pattern.
    @Inject(USER_LOGGER) private readonly logger: AbstractLogger,

    // ── useValue ─────────────────────────────────────────────────────────────
    // A plain object (no class) is injected directly as a constant value.
    @Inject(APP_CONFIG) private readonly config: Record<string, string>,
  ) {
    this.logger.log(
      `UsersService initialised — app: ${this.config['appName']} v${this.config['version']}`,
    );
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  private nextId(): number {
    return this.store.size === 0
      ? 1
      : Math.max(...this.store.keys()) + 1;
  }

  private emailExists(email: string, excludeId?: number): boolean {
    for (const user of this.store.values()) {
      if (user.email === email && user.id !== excludeId) return true;
    }
    return false;
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  create(dto: CreateUserDto): User {
    if (this.emailExists(dto.email)) {
      throw new ConflictException(`Email "${dto.email}" is already taken.`);
    }

    const id = this.nextId();
    const user = new User({ id, ...dto, courses: [] });
    this.store.set(id, user);
    this.logger.log(`Created user #${id} — ${dto.email}`);
    return user;
  }

  findAll(): User[] {
    return [...this.store.values()];
  }

  findOne(id: number): User {
    const user = this.store.get(id);
    if (!user) throw new NotFoundException(`User #${id} not found.`);
    return user;
  }

  update(id: number, dto: UpdateUserDto): User {
    const user = this.findOne(id);

    if (dto.email && this.emailExists(dto.email, id)) {
      throw new ConflictException(`Email "${dto.email}" is already taken.`);
    }

    const updated = new User({ ...user, ...dto });
    this.store.set(id, updated);
    this.logger.log(`Updated user #${id}`);
    return updated;
  }

  remove(id: number): { message: string } {
    this.findOne(id); // throws if not found
    this.store.delete(id);
    this.logger.log(`Deleted user #${id}`);
    return { message: `User #${id} has been removed.` };
  }

  /** Enroll a user in a course (add courseId to user.courses[]) */
  enrollCourse(userId: number, courseId: number): User {
    const user = this.findOne(userId);
    if (!user.courses.includes(courseId)) {
      user.courses.push(courseId);
      this.store.set(userId, user);
      this.logger.log(`User #${userId} enrolled in course #${courseId}`);
    }
    return user;
  }

  /** Remove a user from a course */
  leaveCourse(userId: number, courseId: number): User {
    const user = this.findOne(userId);
    user.courses = user.courses.filter((c) => c !== courseId);
    this.store.set(userId, user);
    this.logger.log(`User #${userId} left course #${courseId}`);
    return user;
  }
}
