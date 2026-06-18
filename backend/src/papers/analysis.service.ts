import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Paper } from '../entities/paper.entity';
import { PapersService } from './papers.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly papersService: PapersService,
  ) {}

  async analyzePaper(paperId: string): Promise<Paper> {
    const paper = await this.papersService.findOne(paperId);
    this.logger.log(
      `Starting AI analysis for paper: ${paper.title} (${paper.id})`,
    );

    const prompt = `Analyze the following research paper text and extract key analytical fields.

Title: ${paper.title}

Abstract:
${paper.abstract || 'Not available'}

Introduction:
${paper.introduction || 'Not available'}

Methodology:
${paper.methodology || 'Not available'}

Results:
${paper.results || 'Not available'}

Conclusion:
${paper.conclusion || 'Not available'}

Respond ONLY with a valid JSON object. Do not include any markdown wrappers (like \`\`\`json) or other conversational text outside of the JSON. It must match this JSON structure:
{
  "summary": "A concise, plain-English summary of the paper (3-4 sentences)",
  "keyContributions": "Bullet points list of primary contributions",
  "findings": "Bullet points list of key results or data findings",
  "limitations": "Bullet points list of limitations of the work",
  "futureWork": "Bullet points list of suggested future work"
}`;

    try {
      const response = await this.aiService.generateCompletion(
        prompt,
        'You are an expert research analyst. You extract structured insights from academic text and return only valid JSON.',
      );

      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const data = JSON.parse(cleanResponse);

      paper.summary = data.summary;
      paper.keyContributions = data.keyContributions;
      paper.findings = data.findings;
      paper.limitations = data.limitations;
      paper.futureWork = data.futureWork;

      return await this.papersService.save(paper);
    } catch (err) {
      this.logger.error(`Failed to analyze paper ${paperId}:`, err);
      // Fallback fallback to mock response
      const mockResponse = this.aiService['getMockResponse']('summarize');
      const data = JSON.parse(mockResponse);
      paper.summary = data.summary;
      paper.keyContributions = data.keyContributions;
      paper.findings = data.findings;
      paper.limitations = data.limitations;
      paper.futureWork = data.futureWork;
      return await this.papersService.save(paper);
    }
  }
}
