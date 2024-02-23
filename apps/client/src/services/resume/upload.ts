import { ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

import { queryClient } from "@/client/libs/query-client";

// Function to perform the actual upload
export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<ResumeDto, AxiosResponse<ResumeDto>>(
    "api/resume/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// Hook to use the upload service
export const useUploadResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: uploadResumeFn,
  } = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      // Assuming you want to cache the uploaded resume data or update existing queries
      queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], data);
      // Update or invalidate relevant queries as needed
      //queryClient.invalidateQueries(["resumes"]);
    },
  });

  return { uploadResume: uploadResumeFn, loading, error };
};
