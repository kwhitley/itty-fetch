export class StatusError extends Error {
  status: number

  constructor(status = 500, message = 'Internal Error.') {
    super(message)
    this.status = status
  }
}
