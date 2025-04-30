import { useQuery } from "@tanstack/react-query";
import { dialogApi } from "~/api/have/dialog";

export const useDialogList = () => {
  return useQuery({
    queryKey: ["dialogList"],
    queryFn: dialogApi.getDialogs,
  });
};

export const useGroupDialogList = () => {
  return useQuery({
    queryKey: ["groupDialogList"],
    queryFn: dialogApi.getGroupDialogs,
  });
};