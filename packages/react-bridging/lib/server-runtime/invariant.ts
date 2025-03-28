export default function invariant(
  value: boolean,
  message?: string
): asserts value;
export default function invariant<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T;
export default function invariant(value: any, message?: string) {
  if (value === false || value === null || typeof value === "undefined") {
    console.error(
      "The following error is a bug in React Bridging; please open an issue! https://github.com/khulnasoft/react-bridging/issues/new/choose"
    );
    throw new Error(message);
  }
}
