import { axios } from "@/client/libs/axios";
import { ChatsDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { CHAT_KEY } from "@/client/constants/query-keys";

export const findChatSessions = async (data: { userId: string }) => {
    const response = await axios.get<ChatsDto[]>(`/chat/sessions/${data.userId}`);
    return response.data;
  };

  export const useChatSessions = (userId: string) => {
    const {
      error,
      isPending: loading,
      data: chatSessions,
    } = useQuery({
      queryKey: [CHAT_KEY,  userId ],
      queryFn: () => findChatSessions({ userId: userId }),
    });
    
    console.log(error,loading,chatSessions);

    return { chatSessions, loading, error };

};
