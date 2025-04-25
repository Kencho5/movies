export interface Channel {
  id: number;
  slug: string;
  name: {
    ru: string;
    en: string;
  };
  logo: string;
  cover: string;
  archiveDays: number;
  live: boolean;
  stream: string;
  thumbnail: string;
  vast: {
    place: string;
    enabled: boolean;
    url: string;
  };
}

export interface ProgramsResponse {
  request: {
    date: string;
    channel_id: string;
  };
  tv: {
    programs: Program[];
  };
}

export interface Program {
  channel: string;
  title: {
    lang: string;
    text: string;
  };
  start: number;
  stop: number;
  vast: {
    place: string;
    enabled: boolean;
    url: string;
  };
}
