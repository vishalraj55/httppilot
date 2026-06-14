export interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  collectionId: string;
}

export interface Collection {
  id: string;
  name: string;
  requests: Request[];
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface RequestHistory {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  timeTaken: number;
  createdAt: string;
}

export interface ProxyResponse {
  statusCode: number;
  statusText: string;
  timeTaken: number;
  size: number;
  headers: Record<string, string>;
  data: any;
  error?: string;
}