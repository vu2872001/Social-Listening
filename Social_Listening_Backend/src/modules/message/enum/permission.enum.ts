export const MessagePerm = {
  GetAllWorkflow: {
    displayName: 'Get All Message',
    permission: 'table-message',
    screen: 'Message',
  },
} as const;

export type MessagePerm = keyof typeof MessagePerm;
