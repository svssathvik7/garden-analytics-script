let originalReferrer = decodeURIComponent(
  document.cookie
    ?.split(";")
    .find((cookie) => {
      return cookie.includes("original_referrer");
    })
    ?.split("=")[1] ?? ""
);

// Remove old original_referrer from cookie if it contains "garden.finance"
if (originalReferrer?.includes("garden.finance")) {
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
