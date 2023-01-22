import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App(): JSX.Element {
  const [url, setUrl] = useState("");

  async function test(): Promise<void> {
    const result = await invoke("save_game", { url });
    console.log(result);
  }

  return (
    <div className="container">
      <input
        type="text"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
        }}
      />
      <button onClick={test}>Test</button>
    </div>
  );
}

export default App;
