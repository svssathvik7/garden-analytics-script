const allowedHosts = [
  "garden.finance",
  "www.garden.finance",
  "app.garden.finance",
  "new.garden.finance",
];

let originalReferrer = decodeURIComponent(
  document.cookie
    ?.split(";")
    .find((cookie) => {
      return cookie?.includes("original_referrer");
    })
    ?.split("=")[1] ?? ""
);

const isAllowedHost = (referrerUrl) => {
  if (!referrerUrl || referrerUrl === "Direct") return false;
  try {
    const { hostname } = new URL(referrerUrl);
    return allowedHosts.some((allowedHost) => hostname === allowedHost);
  } catch (e) {
    return false;
  }
};

// Remove old original_referrer from cookie if it's in allowedHosts
if (isAllowedHost(originalReferrer)) {
  document.cookie = `original_referrer=; domain=.garden.finance; path=/; max-age=0`;
  originalReferrer = null;
}

const currentReferrer = document.referrer;

// Add cookie if first time visitor on any link containing garden.finance
if (!originalReferrer) {
  originalReferrer = currentReferrer === "" ? "Direct" : currentReferrer;
  document.cookie = `original_referrer=${encodeURIComponent(
    originalReferrer
  )}; domain=.garden.finance; path=/; max-age=${60 * 60 * 24 * 180}`;
}
