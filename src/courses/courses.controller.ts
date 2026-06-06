import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // POST /courses
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  // GET /courses
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  // GET /courses/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  // PATCH /courses/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  // DELETE /courses/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }

  // PATCH /courses/:id/enroll/:userId  — add a student to the course
  @Patch(':id/enroll/:userId')
  enrollStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.coursesService.enrollStudent(id, userId);
  }

  // PATCH /courses/:id/remove-student/:userId  — remove a student from the course
  @Patch(':id/remove-student/:userId')
  removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.coursesService.removeStudent(id, userId);
  }
}
