export type CommandsType = Record<
  'start' | 'stop' | 'help' | 'cat' | 'quote' | 'advice' | 'flags' | 'location',
  Record<'command' | 'text' | 'description', string>
>;

export interface IApiLocationData {
  name: string;
  dt: number;
  timezone: number;
  wind: {
    speed: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
}
