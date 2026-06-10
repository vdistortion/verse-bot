export function createErrorHandler() {
  return (err: Error) => {
    console.error(`[VK Error] ${err.message}`);
    console.error(err);
  };
}
