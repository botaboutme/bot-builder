import { ChatDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";

import { CHAT_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const findChatSessions = async () => {
  const response = await axios.get<ChatDto[]>(`/chat/chats`);
  return response.data;
};

export const useChatSessions = () => {
  const {
    error,
    isPending: loading,
    data: chatSessions,
  } = useQuery({
    queryKey: [CHAT_KEY],
    queryFn: () => findChatSessions(),
  });

  console.log(error, loading, chatSessions);

  return { chatSessions, loading, error };
};
