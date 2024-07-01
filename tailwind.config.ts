import type { Config } from "tailwindcss";

const config: Config = {
  darkMode:"class" , 
  important:true ,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        mainGreen : '#1b4332' , 
        lightgreen:"#52b788" , 
        yellow:"#f4d35e" , 
        darkgreen : "#081c15" , 
        mainDark :"#0b090a"
      } , 
      fontFamily :{
        tiny :["Playwrite FR Moderne", "cursive"]
      } , 
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
