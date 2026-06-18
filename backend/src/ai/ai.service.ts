import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatGroq | null = null;
  private hasApiKey = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (
      apiKey &&
      apiKey.trim().length > 0 &&
      apiKey !== 'your_groq_api_key_here'
    ) {
      this.hasApiKey = true;
      try {
        this.model = new ChatGroq({
          apiKey: apiKey,
          model: this.configService.get<string>(
            'GROQ_MODEL',
            'llama-3.3-70b-versatile',
          ),
          temperature: 0.2,
        });
        this.logger.log('Groq ChatModel successfully initialized.');
      } catch (err) {
        this.logger.error('Failed to initialize Groq ChatModel:', err);
        this.hasApiKey = false;
      }
    } else {
      this.logger.warn(
        'GROQ_API_KEY is missing or empty. Application running in Demo/Mock Mode for AI features.',
      );
    }
  }

  async generateCompletion(
    prompt: string,
    systemMessage?: string,
  ): Promise<string> {
    if (!this.hasApiKey || !this.model) {
      return this.getMockResponse(prompt, systemMessage);
    }

    try {
      const messages: any[] = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.model.invoke(messages);
      return response.content as string;
    } catch (err) {
      this.logger.error(
        'Groq API execution failed, falling back to mock response:',
        err,
      );
      return this.getMockResponse(prompt, systemMessage);
    }
  }

  private getMockResponse(prompt: string, systemMessage?: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // 1. Flashcard Generation Prompt Mock
    if (
      lowerPrompt.includes('flashcard') ||
      (systemMessage && systemMessage.toLowerCase().includes('flashcard'))
    ) {
      return JSON.stringify([
        {
          question: 'What is the primary objective of this research paper?',
          answer:
            'The paper proposes a novel, resource-efficient deep learning architecture designed to perform inference on edge devices with minimal latency.',
        },
        {
          question:
            "What methodology was employed to validate the model's accuracy?",
          answer:
            'The researchers evaluated the architecture across three benchmark datasets (ImageNet, CIFAR-10, and COCO) and compared the CPU/GPU throughput against MobileNetV3.',
        },
        {
          question: 'What is the key limitation of the proposed solution?',
          answer:
            'While training time is reduced by 15%, the model experiences a minor accuracy degradation (0.4%) on highly complex multi-class image segmentation tasks.',
        },
        {
          question: 'How does the model handle variable inputs?',
          answer:
            'It uses dynamic spatial routing blocks that dynamically adjust the network depth based on the input complexity, saving computational cycles.',
        },
      ]);
    }

    // 2. Equation Simplifier Prompt Mock
    if (
      lowerPrompt.includes('equation') ||
      lowerPrompt.includes('formula') ||
      lowerPrompt.includes('latex')
    ) {
      return `### Equation Simplification (Mock AI Response)

The equation analyzed is: **$E = mc^2$**

#### 1. Variable Breakdown
- **$E$**: **Energy** (measured in Joules). Represents the total kinetic and potential capability of a system.
- **$m$**: **Mass** (measured in Kilograms). Represents the physical substance/weight of the object.
- **$c$**: **Speed of Light** (constant: $\\approx 3 \\times 10^8$ meters per second). Squaring this constant ($c^2$) yields an extremely large conversion factor.

#### 2. Formula Interpretation
This formula states that mass and energy are two forms of the exact same physical property. A tiny amount of mass can be converted into an immense amount of energy, and vice versa, scaled by the square of the speed of light.

#### 3. Real-World Example
In nuclear fission (such as in nuclear power plants), when a heavy nucleus (like Uranium-235) splits, the sum of the resulting fragments weighs slightly less than the starting atom. That lost mass ($m$) is converted directly into thermal energy ($E$) which heats water, drives turbines, and generates electricity.`;
    }

    // 3. Summarization & Section Analysis Mock
    if (
      lowerPrompt.includes('summarize') ||
      lowerPrompt.includes('contributions') ||
      lowerPrompt.includes('abstract')
    ) {
      return JSON.stringify({
        summary:
          "This research paper introduces an innovative framework named 'ResearchEase' designed to democratize academic reading. It utilizes local tokenizers and semantic chunking to transform dense scientific papers into highly readable, multi-tiered explanations tailored for students, researchers, and professionals.",
        keyContributions:
          '- Implements an automated layout-aware text segmentation algorithm.\n- Outlines a multi-mode LLM prompt layout for Beginner, Intermediate, and Expert comprehension levels.\n- Proposes a lightweight local pgvector indexing pattern running in Node.js.',
        findings:
          '- Visual explanations increase reader retention rate by 42%.\n- Local browser-level vector queries reduce query latencies from 320ms to 45ms compared to cloud-based alternatives.',
        limitations:
          '- The parser currently struggles with heavily stylized double-column PDF pages containing embedded graphical charts.\n- Relies on pre-extracted PDF text lines and does not support image OCR natively.',
        futureWork:
          '- Integrate a vision model (e.g. LLaVA) to automatically parse figures and diagrams.\n- Implement real-time collaborative annotating features for study groups.',
      });
    }

    // 4. Explanation Modes Mock
    if (
      lowerPrompt.includes('beginner') ||
      (systemMessage && systemMessage.toLowerCase().includes('beginner'))
    ) {
      return `### Beginner Explanation (Mock AI Mode)
Imagine a research paper is like a massive, 1000-piece puzzle written in another language. 
Our system takes that puzzle, builds it for you, and explains it like a storybook. 

Instead of using big words like "computational scalability," we just say: "It helps the app run faster on cheaper computers." 
We break down the main idea so that even a 5th grader can understand what the researchers did!`;
    }

    if (
      lowerPrompt.includes('intermediate') ||
      (systemMessage && systemMessage.toLowerCase().includes('intermediate'))
    ) {
      return `### Intermediate Explanation (Mock AI Mode)
This paper focuses on optimizing deep learning models for edge deployment. 
In simple terms, models like ChatGPT require huge, expensive servers to run. The researchers designed a smart pruning technique that removes unnecessary pathways from the neural network. 

Think of it like cleaning a cluttered highway: by removing the slow-moving cars and consolidating traffic, the cars that remain get to their destination much faster. The model runs efficiently on regular smartphones without losing its core accuracy.`;
    }

    if (
      lowerPrompt.includes('expert') ||
      (systemMessage && systemMessage.toLowerCase().includes('expert'))
    ) {
      return `### Expert Explanation (Mock AI Mode)
The paper addresses the challenge of resource constraints during edge inference of Large Language Models (LLMs). The authors introduce a structural network pruning strategy based on gradient-weighted channel activation metrics.

By calculating the sensitivity of individual convolutional filters relative to the loss function, the network dynamically prunes low-saliency channels. This results in a $3.4\\times$ FLOPs reduction and a $2.1\\times$ memory footprint compaction, maintaining a top-1 classification accuracy delta of within $\\pm 0.15\\%$ on ImageNet.`;
    }

    // 5. Standard Chat Mode Mock
    return `### AI Response (Mock AI Mode)

Based on the paper context provided:
The researchers resolved the latency bottleneck by introducing **Dynamic Channel Routing**. Instead of processing every token through the entire 24-layer network, it evaluates the difficulty of the token at layer 6. If the token is simple, it skips layers 7-18 and exits, cutting computational latency by nearly 40%.

*Source: Section 3 (Methodology & Architecture).*`;
  }
}
