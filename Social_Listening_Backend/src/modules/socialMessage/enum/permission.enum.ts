export const CommentPerm = {
  GetAllWorkflow: {
    displayName: 'Get All Comment',
    permission: 'table-comment',
    screen: 'Comment',
  },
} as const;

export type CommentPerm = keyof typeof CommentPerm;
