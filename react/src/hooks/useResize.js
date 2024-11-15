import { useEffect, useState } from "react";

export default function useResize() {
  const [className, setClassName] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setClassName(window.innerWidth < 768 ? "" : "wrapper");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return [className];
}