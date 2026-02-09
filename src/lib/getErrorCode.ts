const getErrorCode = (error: unknown): string | null => {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'error' in error.response.data &&
        error.response.data.error &&
        typeof error.response.data.error === 'object' &&
        'code' in error.response.data.error &&
        'message' in error.response.data.error
    ) {
        return String(error.response.data.error.message);
    }

    return null;
};

export default getErrorCode;