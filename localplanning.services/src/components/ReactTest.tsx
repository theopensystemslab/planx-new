import type React from "react";
import { useState } from "react";

export const ReactTest: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>This is a react component!</h1>
      <p>We're hydrating a JS island here, client side</p>
      <h2>Count: { count }</h2>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>click me</button>
    </>
  )
}