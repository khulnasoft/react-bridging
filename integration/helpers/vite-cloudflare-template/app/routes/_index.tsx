import type { MetaFunction } from "react-bridging";

export const meta: MetaFunction = () => {
  return [
    { title: "New React Bridging App" },
    { name: "description", content: "React Bridging + Cloudflare" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to React Bridging + Cloudflare</h1>
    </div>
  );
}
