import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as pcl from 'postchain-client';
import { GtxClient } from 'postchain-client/built/src/gtx/interfaces';

export type User = {
  pubkey: Buffer;
  name: string;
  email: string;
};

export type Event = {
  name: string;
  description: string;
  date: number;
  location: string;
};

export type GetEventsReturnType = {
  id: number;
  name: string;
  description: string;
  date: number;
  location: string;
};

export type GetUserReturnType = {
  id: number;
  name: string;
  email: string;
};

export type GetAllUsersReturnType = {
  id: number;
  name: string;
  email: string;
};
@Injectable()
export class BlockchainApiService implements OnModuleInit {
  private gtx: GtxClient; // Store the gtx client as an instance property
  //Key pair
  private adminPubkey = Buffer.from(
    '031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f',
    'hex',
  );
  private adminPrivkey = Buffer.from(
    '0101010101010101010101010101010101010101010101010101010101010101',
    'hex',
  );

  onModuleInit() {
    const nodeApiUrl = 'http://localhost:7740/'; //Using default postchain node REST API port
    const blockchainRID =
      '3674F2677415B00E4B80E3B9D5F02CD632978A3E0447BBDABAD520E6D0F6A523'; //Dapp Blockchain RID
    const rest = pcl.restClient.createRestClient([nodeApiUrl], blockchainRID);
    this.gtx = pcl.gtxClient.createClient(rest, blockchainRID, ['set_name']); //gtx Client connection
  }

  async helloWorld(): Promise<string> {
    return await this.gtx.query('hello_world');
  }

  async setNameOperation(name: string): Promise<void> {
    const tx = this.gtx.newTransaction([this.adminPubkey]);
    console.log('adding name', name);
    tx.addOperation('set_name', name);
    tx.addOperation('nop', randomBytes(12));
  }

  async createEventOperation(
    eventName: string,
    eventDescription: string,
    eventLocation: string,
    eventTimestamp: number,
    amount: number,
  ): Promise<void> {
    const tx = this.gtx.newTransaction([this.adminPubkey]);

    tx.addOperation(
      'create_event',
      eventName,
      eventDescription,
      eventLocation,
      eventTimestamp,
      amount,
    );
    tx.sign(this.adminPrivkey, this.adminPubkey); //Sign transaction
    await tx.postAndWaitConfirmation(); //Post to blockchain node
  }

  async createUserAdminOperation(name: string, email: string): Promise<void> {
    const tx = this.gtx.newTransaction([this.adminPubkey]);
    tx.addOperation('create_user_admin', name, email);
    tx.sign(this.adminPrivkey, this.adminPubkey); //Sign transaction
    await tx.postAndWaitConfirmation(); //Post to blockchain node
  }

  async getEvents(): Promise<GetEventsReturnType[]> {
    return await this.gtx.query('get_events');
  }

  async getAvailableTicketsForEvent(event: number): Promise<number> {
    return await this.gtx.query('get_available_tickets_for_event', {
      event: event,
    });
  }

  async getUser(pubkey: Buffer): Promise<GetUserReturnType> {
    return await this.gtx.query('get_user', { pubkey: pubkey });
  }

  async getAllUsers(): Promise<GetAllUsersReturnType[]> {
    return await this.gtx.query('get_all_users');
  }

  async transferTicketOperation(
    receiver: Buffer,
    ticket: number,
  ): Promise<void> {
    const tx = this.gtx.newTransaction([this.adminPubkey]);
    tx.addOperation('transfer_ticket', receiver, ticket);
  }

  async getMyTickets(pubkey: Buffer): Promise<number[]> {
    return await this.gtx.query('get_my_tickets', { pubkey: pubkey });
  }
}
