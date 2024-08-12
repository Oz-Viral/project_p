import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { shuffle } from 'lodash';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
});

@Injectable()
export class OpenaiService {
  async generateImage(prompt: string) {
    return (
      await openai.images.generate({
        prompt,
        response_format: 'b64_json',
        model: 'dall-e-3',
      })
    ).data[0].b64_json;
  }

  async generatePosts(content: string) {
    const posts = (
      await Promise.all([
        openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content:
                'Generate a Twitter post from the content without emojis in the following JSON format: { "post": string } put it in an array with one element',
            },
            {
              role: 'user',
              content: content!,
            },
          ],
          n: 5,
          temperature: 1,
          model: 'gpt-4o',
        }),
        openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content:
                'Generate a thread for social media in the following JSON format: Array<{ "post": string }> without emojis',
            },
            {
              role: 'user',
              content: content!,
            },
          ],
          n: 5,
          temperature: 1,
          model: 'gpt-4o',
        }),
      ])
    ).flatMap((p) => p.choices);

    return shuffle(
      posts.map((choice) => {
        const { content } = choice.message;
        const start = content?.indexOf('[')!;
        const end = content?.lastIndexOf(']')!;
        try {
          return JSON.parse(
            '[' +
              content
                ?.slice(start + 1, end)
                .replace(/\n/g, ' ')
                .replace(/ {2,}/g, ' ') +
              ']',
          );
        } catch (e) {
          console.log(content);
          return [];
        }
      }),
    );
  }
  async extractWebsiteText(content: string) {
    const websiteContent = await openai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'Your take a full website text, and extract only the article content',
        },
        {
          role: 'user',
          content,
        },
      ],
      model: 'gpt-4o',
    });

    const { content: articleContent } = websiteContent.choices[0].message;

    return this.generatePosts(articleContent!);
  }

  // 해시태그 생성
  async generateHashtags(content: string) {
    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `
            당신은 소셜 미디어 전문가입니다. 아래의 텍스트를 기반으로 적절하고 인기 있는 인스타그램 해시태그 5개를 생성해 주세요. 해시태그는 간결하고 본문과 직접 관련된 내용이어야 합니다.
          
            텍스트: "${content}"
          
            해시태그:
            `,
          },
          {
            role: 'user',
            content,
          },
        ],
        temperature: 1,
        max_tokens: 50,
        model: 'gpt-4o-mini',
      });
      const hashtags = response.choices[0].message.content;
      console.log('생성된 해시태그:', hashtags);
      return { hashtags };
    } catch (error) {
      console.error('해시태그 생성 중 오류 발생:', error);
      return '';
    }
  }
}
