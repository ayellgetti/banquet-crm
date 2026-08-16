import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import {
  DirectoryContactRepository,
  toDirectoryContactResponse,
  type DirectoryContactResponse,
} from './directory-contact.repository.js';
import type { CreateDirectoryContactInput, ListDirectoryContactsQuery } from './directory-contact.schema.js';

export class DirectoryContactService {
  constructor(private readonly repository: DirectoryContactRepository) {}

  async list(query: ListDirectoryContactsQuery): Promise<PaginatedResult<DirectoryContactResponse>> {
    const [contacts, total] = await this.repository.findAll(query);

    return {
      items: contacts.map(toDirectoryContactResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async create(input: CreateDirectoryContactInput): Promise<DirectoryContactResponse> {
    const contact = await this.repository.create({
      type: input.type,
      name: input.name.trim(),
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      notes: input.notes,
    });

    return toDirectoryContactResponse(contact);
  }
}
