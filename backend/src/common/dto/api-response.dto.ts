export class ApiResponse<T> {
  constructor(public readonly data: T) {}

  static of<T>(data: T): ApiResponse<T> {
    return new ApiResponse(data);
  }
}
