import type { MetaFunction } from "react-bridging";

export const meta: MetaFunction = () => {
  return [
    { title: "New React Bridging App" },
    { name: "description", content: "Welcome to React Bridging!" },
  ];
};

export default function Index() {
  return <h1>Welcome to React Bridging</h1>;
}
