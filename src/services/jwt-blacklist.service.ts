import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtBlacklistService {
  private readonly blacklist = new Set<string>();

  async add(token: string) {
    this.blacklist.add(token);
  }

  async has(token: string): Promise<boolean> {
    return this.blacklist.has(token);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.blacklist.has(token);
  }
}
