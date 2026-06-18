import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../entities/paper.entity';
import * as fs from 'fs';

@Injectable()
export class PapersService {
  constructor(
    @InjectRepository(Paper)
    private paperRepository: Repository<Paper>,
  ) {}

  async findAll(): Promise<Paper[]> {
    return this.paperRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Paper> {
    const paper = await this.paperRepository.findOne({
      where: { id },
    });
    if (!paper) {
      throw new NotFoundException(`Paper with ID ${id} not found`);
    }
    return paper;
  }

  async createPaper(
    title: string,
    filename: string,
    filePath: string,
  ): Promise<Paper> {
    const paper = this.paperRepository.create({
      title,
      pdfUrl: `/api/papers/download/${filename}`,
      fileKey: filePath,
    });
    return this.paperRepository.save(paper);
  }

  async save(paper: Paper): Promise<Paper> {
    return this.paperRepository.save(paper);
  }

  async deletePaper(id: string): Promise<void> {
    const paper = await this.findOne(id);
    if (fs.existsSync(paper.fileKey)) {
      try {
        fs.unlinkSync(paper.fileKey);
      } catch (err) {
        console.error(`Failed to delete file ${paper.fileKey}:`, err);
      }
    }
    await this.paperRepository.remove(paper);
  }
}
