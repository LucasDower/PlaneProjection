export function ASSERT(condition: any, errorMessage = 'Assertion Failed'): asserts condition {
    if (!condition) {
        throw Error(errorMessage);
    }
}