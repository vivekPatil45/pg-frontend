/**
 * Extracts a user-friendly error message from a backend error response.
 * Handles both general messages and specific field validation errors.
 */
export function getErrorMessage(err: any, fallback: string = 'Operation failed. Please try again.'): string {
    if (!err || !err.error) {
        return fallback;
    }

    const { error } = err;

    // Check for structured validation errors
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        // Return the first validation error message
        return error.errors[0].message;
    }

    // Check for general message
    if (error.message) {
        return error.message;
    }

    return fallback;
}
