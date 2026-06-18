import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class EquationService {
  constructor(private readonly aiService: AiService) {}

  async simplifyEquation(equation: string): Promise<string> {
    const systemMessage =
      'You are a mathematics and engineering professor. You specialize in breaking down complex mathematical formulas, equations, and LaTeX notation into plain terms.';
    const prompt = `Simplify and explain the following mathematical equation or formula:

Equation/Formula:
${equation}

Please format your response clearly in markdown:
1. **Variable Breakdown**: List and explain each symbol/variable.
2. **Formula Interpretation**: Explain the overall logic or relationship the formula defines in plain English.
3. **Real-World Example**: Give a practical, easy-to-understand analogy or application of this formula in action.`;

    return this.aiService.generateCompletion(prompt, systemMessage);
  }
}
