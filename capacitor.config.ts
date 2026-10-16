import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.graycompany.belicia",
  appName: "Belicia",
  webDir: "dist",
  // Serve compiled assets directly from the APK; never point production
  // builds at a remote website or an HTTP development server.
  android: {
    backgroundColor: "#000000",
    allowMixedContent: false,
  },
};

export default config;
