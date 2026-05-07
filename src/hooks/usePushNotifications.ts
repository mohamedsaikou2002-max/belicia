import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("lovableproject.com") ||
   window.location.hostname.includes("id-preview--"));

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

export function usePushNotifications(userId = "default") {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isPreviewHost || isInIframe) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setIsSupported(true);
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    }).catch(() => {});
  }, []);

  const subscribe = async () => {
    if (!isSupported) return;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      ...(vapid ? { applicationServerKey: vapid } : {}),
    });
    await supabase.from("belicia_profile")
      .update({ push_subscription: sub.toJSON() as any })
      .eq("user_id", userId);
    setIsSubscribed(true);
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    await sub?.unsubscribe();
    await supabase.from("belicia_profile")
      .update({ push_subscription: null })
      .eq("user_id", userId);
    setIsSubscribed(false);
  };

  return { isSupported, isSubscribed, subscribe, unsubscribe };
}
