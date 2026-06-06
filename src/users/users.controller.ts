import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { existsSync } from 'fs';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';

// ── Multer storage config ─────────────────────────────────────────────────────
// Files are saved to  /uploads/avatars/<timestamp>-<original-name>
const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── POST /users ─────────────────────────────────────────────────────────────
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ── GET /users ──────────────────────────────────────────────────────────────
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ── GET /users/:id ──────────────────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // ── PATCH /users/:id ────────────────────────────────────────────────────────
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // ── DELETE /users/:id  (requires auth + admin role) ────────────────────────
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // ── PATCH /users/:id/enroll/:courseId ───────────────────────────────────────
  @Patch(':id/enroll/:courseId')
  enroll(
    @Param('id', ParseIntPipe) id: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.usersService.enrollCourse(id, courseId);
  }

  // ── PATCH /users/:id/leave/:courseId ────────────────────────────────────────
  @Patch(':id/leave/:courseId')
  leave(
    @Param('id', ParseIntPipe) id: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.usersService.leaveCourse(id, courseId);
  }

  // ── POST /users/:id/avatar  (upload profile image via multer) ───────────────
  /**
   * Accepts multipart/form-data with field name "avatar".
   * Allowed types: jpg, jpeg, png, gif, webp  — max 5 MB.
   * Returns the updated user with avatarPath set.
   *
   * curl example:
   *   curl -X POST http://localhost:4000/users/1/avatar \
   *        -F "avatar=@/path/to/photo.jpg"
   */
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(
            new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded. Use field name "avatar".');
    }
    // Store relative path so it works on any machine
    const relativePath = `uploads/avatars/${file.filename}`;
    return this.usersService.uploadAvatar(id, relativePath);
  }

  // ── GET /users/:id/avatar  (stream/serve the profile image) ─────────────────
  /**
   * Returns the raw image file directly — no JSON wrapping.
   *
   * curl example:
   *   curl http://localhost:4000/users/1/avatar --output photo.jpg
   *
   * Note: This route bypasses the ResponseInterceptor intentionally
   * (we @Res() directly so NestJS does not touch the response).
   */
  @Get(':id/avatar')
  getAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const avatarPath = this.usersService.getAvatarPath(id);

    if (!avatarPath) {
      throw new NotFoundException(`User #${id} has no avatar uploaded.`);
    }

    const absolutePath = join(process.cwd(), avatarPath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Avatar file not found on disk.');
    }

    return res.sendFile(absolutePath);
  }
}
