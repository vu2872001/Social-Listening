import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { PostWithInfo } from '../dtos/postWithInfo.dto';

@Injectable()
export class SocialPostService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPostWithTabId(tabId: string) {
    try {
      let listPosts = await this.prismaService.$queryRaw<PostWithInfo[]>`SELECT
          "SocialPost"."id",
          "SocialPost"."message",
          "SocialPost"."createdAt",
          "lastMessage"."message" AS "lastMessage",
          "lastMessage"."createdAt" AS "lastMessageAt",
          COUNT ( "SocialMessage"."id" ) AS "totalComment",
          COUNT ( CASE WHEN "SocialMessage"."isRead" = FALSE THEN 1 ELSE NULL END ) AS "totalUnreadComment"
        FROM
          "SocialPost"
        LEFT JOIN (
          SELECT
            "parentId",
            "createdAt",
            "message" 
          FROM
            "SocialMessage" 
          WHERE
            ( "parentId", "createdAt" ) 
            IN ( 
              SELECT "parentId", MAX ( "createdAt" ) 
              FROM "SocialMessage" 
              WHERE "type" != 'Bot' AND TYPE NOT LIKE'%Agent%' GROUP BY "parentId" 
            ) 
        ) AS "lastMessage" ON "SocialPost"."id" = "lastMessage"."parentId"
        LEFT JOIN "SocialMessage" ON "SocialPost"."id" = "SocialMessage"."parentId" 
        WHERE "SocialPost"."tabId" = ${tabId}
        GROUP BY
          "SocialPost"."id",
          "SocialPost"."message",
          "lastMessage"."createdAt",
          "lastMessage"."message" 
        ORDER BY
          "lastMessageAt" DESC;
      `;

      listPosts = listPosts.map((post) => {
        return {
          ...post,
          totalComment: Number(post.totalComment),
          totalUnreadComment: Number(post.totalUnreadComment),
        };
      });

      return listPosts;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
