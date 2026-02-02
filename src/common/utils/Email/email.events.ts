import { Injectable } from '@nestjs/common';
import EventEmitter from 'events';
import { SendEmail } from './send.email';

export enum Email_Events_Enum {
  Verify_Email = 'verifyEmail',
  Reset_Password = 'RESET PASSWORD',
}
@Injectable()
export class EventsForEmail {
  constructor(private readonly emitter: EventEmitter) {}
  subscribe = (
    event: Email_Events_Enum,
    callback: (payload: any) => void | Promise<void>,
  ) => {
    this.emitter.on(event, (payload) => void callback(payload));
  };
  publish = (event: Email_Events_Enum, payload: any) => {
    this.emitter.emit(event, payload);
  };
}
const emitter = new EventEmitter();
export const emailEmitter = new EventsForEmail(emitter);
emailEmitter.subscribe(
  Email_Events_Enum.Verify_Email,
  async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) => {
    await SendEmail({ to, subject, html });
  },
);
emailEmitter.subscribe(
  Email_Events_Enum.Reset_Password,
  async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) => {
    await SendEmail({ to, subject, html });
  },
);
