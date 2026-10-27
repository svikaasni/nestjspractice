export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_RULE_VIOLATION',
    public readonly status: number = 400,
    public readonly details: any = null,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resourceName: string, identifier?: string) {
    super(
      identifier ? `${resourceName} with ID '${identifier}' was not found` : `${resourceName} not found`,
      'RESOURCE_NOT_FOUND',
      404,
    );
    this.name = 'ResourceNotFoundException';
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message: string = 'Unauthorized operation') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedDomainException';
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(message: string = 'Access denied') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenDomainException';
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictDomainException';
  }
}
