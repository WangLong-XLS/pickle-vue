import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import router from "@/router";

// 定义响应数据的类型
interface ResponseData<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

// 扩展 AxiosRequestConfig 以支持 fileName
interface CustomRequestConfig extends AxiosRequestConfig {
  fileName?: string;
}

const service: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8888/pickle",
  timeout: 50000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers["Content-Type"] = "application/json;charset=utf-8";

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          config.headers["token"] = user.token;
        }
      } catch (e) {
        console.error("解析 user 数据失败", e);
      }
    }

    return config;
  },
  (error: unknown) => {
    console.log("请求拦截器错误: " + error);
    return Promise.reject(error);
  }
);

let isRedirecting = false;

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse): any => {
    // 处理文件下载的情况
    if (response.config.responseType === "blob") {
      return handleFileResponse(response);
    }

    let res: ResponseData = response.data;

    // 如果响应数据是字符串，尝试解析为 JSON
    if (typeof res === "string") {
      try {
        res = JSON.parse(res);
      } catch (e) {
        console.error("JSON 解析失败", e);
        return res;
      }
    }

    // 处理业务层 401（响应体 code === 401）
    if (res.code === 401) {
      handle401(res.message);
      return { code: 401, message: res.message, data: null };
    }

    return res;
  },
  (error: any) => {
    // HTTP 状态码 401（未登录或 token 过期）
    if (error.response && error.response.status === 401) {
      const data = error.response.data;
      const message = data?.message || "登录已过期，请重新登录";
      handle401(message);
      return Promise.resolve({ code: 401, message, data: null });
    }

    console.log("响应拦截器错误: " + error);
    return Promise.reject(error);
  }
);

/** 统一处理 401：清除登录态并跳转登录页 */
function handle401(message?: string) {
  localStorage.removeItem("user");

  if (!isRedirecting) {
    isRedirecting = true;
    router.push("/login").finally(() => {
      setTimeout(() => {
        isRedirecting = false;
      }, 2000);
    });
  }
}

// 处理文件响应
function handleFileResponse(response: AxiosResponse): Promise<any> {
  const contentType =
    (response.headers["content-type"] as string) || "application/octet-stream";

  // 检查是否是错误响应（后端返回的 JSON 错误）
  if (contentType.includes("application/json")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          reject(errorData);
        } catch (e) {
          reject(response.data);
        }
      };
      reader.onerror = () => reject(response.data);
      reader.readAsText(response.data);
    });
  }

  const blob = new Blob([response.data], {
    type: contentType,
  });

  let fileName = "export.xlsx";

  // 1. 从响应头获取文件名
  const contentDisposition = response.headers["content-disposition"] as string;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      fileName = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""));
    }
  }
  // 2. 从请求配置中获取文件名
  else if ((response.config as CustomRequestConfig).fileName) {
    fileName = (response.config as CustomRequestConfig).fileName!;
  }
  // 3. 使用默认文件名
  else {
    const today = new Date().toISOString().slice(0, 10);
    fileName = `export_${today}.xlsx`;
  }

  // 创建下载链接
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return Promise.resolve({ success: true });
}

export default service;
