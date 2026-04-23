export default function throws<T>(message: string): T {
  throw new Error(message);
}
