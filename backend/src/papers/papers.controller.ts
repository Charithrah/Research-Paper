import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  BadRequestException,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PapersService } from './papers.service';
import { ProcessingService } from './processing.service';
import { ExplanationService } from './explanation.service';
import { EquationService } from './equation.service';
import { FlashcardService } from './flashcard.service';
import { ChatService } from './chat.service';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const storageConfig = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_');
    callback(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

@Controller('papers')
export class PapersController {
  constructor(
    private readonly papersService: PapersService,
    private readonly processingService: ProcessingService,
    private readonly explanationService: ExplanationService,
    private readonly equationService: EquationService,
    private readonly flashcardService: FlashcardService,
    private readonly chatService: ChatService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Only PDF files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const cleanTitle = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );

    const paper = await this.papersService.createPaper(
      cleanTitle,
      file.filename,
      file.path,
    );

    // Trigger full RAG processing asynchronously in the background
    this.processingService.processPaper(paper.id).catch((err) => {
      console.error(`Error processing paper ${paper.id} in background:`, err);
    });

    return {
      message: 'Paper uploaded successfully. Processing in background.',
      paper,
    };
  }

  @Post(':id/process')
  async processPaper(@Param('id') id: string) {
    await this.processingService.processPaper(id);
    return {
      message: 'Paper processed successfully.',
    };
  }

  @Get()
  async getPapers() {
    return this.papersService.findAll();
  }

  @Get(':id')
  async getPaper(@Param('id') id: string) {
    return this.papersService.findOne(id);
  }

  @Delete(':id')
  async deletePaper(@Param('id') id: string) {
    await this.papersService.deletePaper(id);
    return { message: 'Paper deleted successfully' };
  }

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'File not found' });
    }
    return res.sendFile(path.resolve(filePath));
  }

  // Phase 7: Explanation modes
  @Get(':id/explain')
  async explainSection(
    @Param('id') id: string,
    @Query('section') section: string,
    @Query('mode') mode: 'beginner' | 'intermediate' | 'expert',
  ) {
    const explanation = await this.explanationService.explainSection(
      id,
      section,
      mode,
    );
    return { explanation };
  }

  // Phase 8: Equation Simplifier
  @Post(':id/simplify-equation')
  async simplifyEquation(
    @Param('id') id: string,
    @Body('equation') equation: string,
  ) {
    if (!equation || equation.trim().length === 0) {
      throw new BadRequestException('Equation string is required');
    }
    const explanation = await this.equationService.simplifyEquation(equation);
    return { explanation };
  }

  // Phase 9: Flashcards
  @Get(':id/flashcards')
  async getFlashcards(@Param('id') id: string) {
    const flashcards = await this.flashcardService.getOrGenerateFlashcards(id);
    return { flashcards };
  }

  // Phase 10: AI Chat
  @Get(':id/chat')
  async getChat(@Param('id') id: string) {
    const chatHistory = await this.chatService.getChatHistory(id);
    return { chatHistory };
  }

  @Post(':id/chat')
  async sendChatMessage(
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message string is required');
    }
    const chat = await this.chatService.sendMessage(id, message);
    return { chat };
  }
}
