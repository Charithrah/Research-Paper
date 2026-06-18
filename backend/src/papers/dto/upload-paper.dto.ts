import { IsString, IsOptional } from 'class-validator';

export class UploadPaperDto {
  @IsString()
  @IsOptional()
  userId?: string;
}
