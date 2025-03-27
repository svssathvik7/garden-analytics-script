let originalReferrer = decodeURIComponent(
  document.cookie
    ?.split(";")
    .find((cookie) => {
      return cookie.includes("original_referrer");
    })
    ?.split("=")[1] ?? ""
);

const currentReferrer = document.referrer;

// Add cookie if first time visitor on any link containing garden.finance
if (!originalReferrer) {
  originalReferrer = currentReferrer === "" ? "Direct" : currentReferrer;
  document.cookie = `original_referrer=${encodeURIComponent(
    originalReferrer
  )}; domain=.garden.finance; path=/; max-age=${60*60*24*180}`;
}
