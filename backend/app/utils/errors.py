class AppError(Exception):
    def __init__(self, status_code: int, error_type: str, message: str):
        self.status_code = status_code
        self.error_type = error_type
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(404, "not_found", f"{resource} not found")
