import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
  constructor(private readonly parserService: FileService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file')) // теперь массив
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файл не передан');
    }

    // если один файл — обрабатываем как один
    if (files.length === 1) {
      return this.parserService.parseFile(files[0]);
    }

    // если несколько — обрабатываем как массив
    return Promise.all(files.map(file => this.parserService.parseFile(file)));
  }
}