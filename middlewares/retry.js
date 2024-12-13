export const retryOperation = async (operation, maxRetries = 5, delay = 1000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (retries >= maxRetries - 1) {
        throw new Error(`Max retries reached. Operation failed: ${error.message}`);
      }
      retries++;
      const backoffDelay = delay * Math.pow(2, retries); // Exponential backoff
      console.log(`Retrying... Attempt ${retries + 1} after ${backoffDelay / 1000}s`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};