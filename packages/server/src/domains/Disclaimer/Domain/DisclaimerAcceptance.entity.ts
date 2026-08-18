import { IDisclaimerAcceptance } from './DisclaimerAcceptance.types';

export class DisclaimerHash {
  constructor(readonly value: string) {
    if (!/^[0-9a-f]{64}$/.test(value)) {
      throw new Error('Hash must be exactly 64 hex characters');
    }
  }
}

export class IPAddress {
  constructor(readonly value: string) {
    if (!value || value.length === 0) {
      throw new Error('IP address cannot be empty');
    }
  }
}

export class UserAgent {
  constructor(readonly value: string | null) {}
}

export class DisclaimerAcceptance {
  constructor(
    private readonly _id_usuario: number,
    private readonly _id_empresa: number,
    private readonly _hash_prueba: DisclaimerHash,
    private readonly _ip: IPAddress,
    private readonly _user_agent: UserAgent,
    private readonly _timestamp: Date,
    private readonly _terms_version_id: number | null,
    private readonly _id?: number,
  ) {}

  static create({
    id,
    id_usuario,
    id_empresa,
    hash_prueba,
    ip,
    user_agent,
    timestamp,
    terms_version_id,
  }: IDisclaimerAcceptance): DisclaimerAcceptance {
    if (terms_version_id == null) {
      throw new Error('Terms version is required for an acceptance');
    }

    return new DisclaimerAcceptance(
      id_usuario,
      id_empresa,
      new DisclaimerHash(hash_prueba),
      new IPAddress(ip),
      new UserAgent(user_agent ?? null),
      timestamp instanceof Date ? timestamp : new Date(timestamp),
      terms_version_id,
      id,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      id: this._id,
      id_usuario: this._id_usuario,
      id_empresa: this._id_empresa,
      hash_prueba: this._hash_prueba.value,
      ip: this._ip.value,
      user_agent: this._user_agent.value,
      timestamp: this._timestamp,
      terms_version_id: this._terms_version_id,
    };
  }
}
