export interface IApiCatData {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface IApiQuoteData {
  quoteText: string;
  quoteAuthor: string;
  quoteLink: string;
}

export interface IApiQuoteParams {
  method: string;
  key: number;
  format: string;
  lang: string;
}

export interface IApiAdviceData {
  id: number;
  text: string;
}
