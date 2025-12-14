import { useContext, useEffect } from "react";
import axiosFetch from "./axiosFetch";
import { LoadingContext } from "../context/LoadingContext";

export default function useAxiosLoader() {
  const { setIsLoading } = useContext(LoadingContext);

  useEffect(() => {
    const requestInterceptor = axiosFetch.interceptors.request.use(config => {
      setIsLoading(true);
      return config;
    });

    const responseInterceptor = axiosFetch.interceptors.response.use(
      response => {
        setIsLoading(false);
        return response;
      },
      error => {
        setIsLoading(false);
        return Promise.reject(error);
      }
    );

    return () => {
      axiosFetch.interceptors.request.eject(requestInterceptor);
      axiosFetch.interceptors.response.eject(responseInterceptor);
    };
  }, []);
}
