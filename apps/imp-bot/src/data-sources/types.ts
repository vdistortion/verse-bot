export interface IApiCatData {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface IApiAdviceData {
  id: number;
  text: string;
}

export interface IApiRandomFactData {
  id: number;
  legacy_nid: number;
  title: string;
}

export interface IApiFactData {
  id: number;
  legacy_nid: number;
  title: string;
  body: string;
  tags: { name: string }[];
  sources: { title: string; url: string }[];
}
