//mail module should have API key
export interface MailModuleOptions {
  apiKey: string;
  domain: string;
  fromEmail: string;
}

export interface EmailVar {
  key: string;
  value: string;
}
