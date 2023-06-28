import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialPostDTO } from '../dtos/socialMessage.dto';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class SocialPostService {
  constructor(private prismaService: PrismaService) {}

  async savePost(message: SocialPostDTO) {
    const savedMessage = await this.prismaService.socialPost.create({
      data: message,
    });
    return savedMessage;
  }

  async findPost(socialPostId: string) {
    const savedMessage = await this.prismaService.socialPost.findFirst({
      where: { postId: socialPostId },
    });
    return savedMessage;
  }

  async getAllPostIds() {
    const allPostIds = await this.prismaService.socialPost.findMany({
      select: { id: true },
    });
    return allPostIds.map((post) => post.id);
  }

  async getSocialPostById(postId: string) {
    const socialPost = await this.prismaService.socialPost.findFirst({
      where: { id: postId },
    });
    return excludeData(socialPost, ['tabId']);
  }
}
