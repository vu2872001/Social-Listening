import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SocialPostService } from '../services/socialPost.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { PostWithInfo } from '../dtos/postWithInfo.dto';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';

@Controller('social-post')
export class SocialPostController {
  constructor(
    private readonly socialPostService: SocialPostService,
    private readonly userInTabService: UserInTabService,
  ) {}

  @Get('/:tabId')
  @UseGuards(JWTAuthGuard)
  async getAllPost(@Req() req: RequestWithUser, @Param() { tabId }) {
    const user = req.user;
    const result = new ReturnResult<PostWithInfo[]>();
    try {
      const check = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!check) throw new Error(`You cannot view this post`);

      const listPosts = await this.socialPostService.getAllPostWithTabId(tabId);
      result.result = listPosts;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
