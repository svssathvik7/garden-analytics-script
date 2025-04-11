const TrafficSourceType = {
  Referrer: "Referrer",
  Direct: "Direct",
};

const createTrafficSource = {
  referrer: (platform) => ({
    Referrer: { platform },
  }),

  direct: () => ({
    Direct: null,
  }),
};

const getIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org/?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
};

const FIXED_KEY_HEX =
  "5ebe2294ecd0e0f08eab7690d2a6ee69f4f1e5e388f77b22553060fdb7696db9";
const FIXED_IV_HEX = "79e4c9221c884fc5bcdf6879";

const generateEncryptionKey = async () => {
  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 64; i += 2) {
    keyBytes[i / 2] = parseInt(FIXED_KEY_HEX.substr(i, 2), 16);
  }

  const key = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return { key, base64Key: FIXED_KEY_HEX };
};

const encryptData = async (data, key) => {
  // Use fixed IV instead of random generation
  const iv = new Uint8Array(12);
  for (let i = 0; i < FIXED_IV_HEX.length && i < 24; i += 2) {
    iv[i / 2] = parseInt(FIXED_IV_HEX.slice(i, i + 2), 16);
  }

  // Convert data to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataBuffer
  );

  // Convert encrypted data and IV to base64 for transmission
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  );

  return {
    encrypted: encryptedBase64,
    iv: FIXED_IV_HEX,
  };
};

const makeConsistentUrl = (url) => {
  const { hostname, pathname, searchParams } = new URL(url);
  const newHost = hostname.includes("www.")
    ? hostname.split("www.")[1]
    : hostname;

  let searchParamsLength = 0;
  searchParams.forEach(() => searchParamsLength++);

  if (searchParamsLength > 0) {
    const newUrl = `https://${newHost}${pathname}?${searchParams.toString()}`;
    return newUrl;
  }

  const newUrl = `https://${newHost}${pathname}`;
  return newUrl.endsWith("/") ? newUrl : newUrl + "/";
};

const trackTrafficSource = async () => {
  const allowedHosts = [
    "garden.finance",
    "www.garden.finance",
    "app.garden.finance",
    "legacy.garden.finance",
  ];

  let originalReferrer = decodeURIComponent(
    document.cookie
      ?.split(";")
      .find((cookie) => {
        return cookie?.includes("original_referrer");
      })
      ?.split("=")[1] ?? ""
  );
  let storedReferrer = localStorage.getItem("referrer");
  const currentReferrer = document.referrer;
  const utmSource = new URL(window.location.href).searchParams.get(
    "utm_source"
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

  // Add cookie if first time visitor on any link containing garden.finance
  if (!storedReferrer && !originalReferrer) {
    originalReferrer = currentReferrer === "" ? "Direct" : currentReferrer;
    document.cookie = `original_referrer=${encodeURIComponent(
      originalReferrer
    )}; domain=.garden.finance; path=/; max-age=${60 * 60 * 24 * 180}`;
  }

  if (!storedReferrer) {
    let source_type;

    if (utmSource) {
      // utm_source overrides everything
      localStorage.setItem("referrer", utmSource);
      source_type = createTrafficSource.referrer(utmSource);
    } else if (isAllowedHost(currentReferrer)) {
      // If referrer is one of the allowedHosts, use the original referrer
      localStorage.setItem("referrer", originalReferrer);
      source_type =
        originalReferrer === "Direct"
          ? createTrafficSource.direct()
          : createTrafficSource.referrer(originalReferrer);
    } else if (currentReferrer == "") {
      localStorage.setItem("referrer", "Direct");
      source_type = createTrafficSource.direct();
    } else {
      localStorage.setItem("referrer", currentReferrer);
      source_type = createTrafficSource.referrer(currentReferrer);
    }
    /* javascript-obfuscator:disable */
    let payload = {
      route: "/t/record",
      data: {
        source_type: source_type,
        url: makeConsistentUrl(window.location.href),
      },
    };
    /* javascript-obfuscator:enable */
    const { key, base64Key } = await generateEncryptionKey();

    // Encrypt the payload
    const encryptedData = await encryptData(payload, key);

    // Create the final encrypted payload
    const encryptedPayload = {
      data: encryptedData.encrypted,
    };

    fetch("https://nexosesi-v1.hashira.io/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedPayload),
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {});
  }
};

const sendWalletData = async (address) => {
  if (!window.ethereum) {
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    const isConnected = accounts && accounts.length > 0;

    if (isConnected && address) {
      let source;
      const referrer = localStorage.getItem("referrer") || "Direct";
      if (referrer == "Direct") {
        source = createTrafficSource.direct();
      } else {
        source = createTrafficSource.referrer(referrer);
      }
      /* javascript-obfuscator:disable */
      const payload = {
        route: "/w/record",
        data: {
          ip: await getIpAddress(),
          wallet_address: address.toLowerCase(),
          source: {
            source_type: source,
            url: makeConsistentUrl(window.location.href),
          },
          wallet_type: getWalletType(),
        },
      };
      /* javascript-obfuscator:enable */

      // Generate a new encryption key
      const { key, base64Key } = await generateEncryptionKey();

      // Encrypt the payload
      const encryptedData = await encryptData(payload, key);

      // Create the final encrypted payload
      const encryptedPayload = {
        data: encryptedData.encrypted,
      };

      // Log the encrypted payload before sending

      fetch("https://nexosesi-v1.hashira.io/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encryptedPayload),
      });
    }
  } catch (error) {}
};

const getWalletType = () => {
  if (!window.ethereum) return null;

  // Check for specific wallet providers
  if (window.ethereum.isMetaMask) return "metamask";
  if (window.ethereum.isBraveWallet) return "brave";
  if (window.ethereum.isPhantom) return "phantom";
  if (window.ethereum.isCoinbaseWallet) return "coinbase";
  if (window.ethereum.isOKXWallet) return "okx";
  if (window.ethereum.isRabby) return "rabby";
  if (window.unisat) return "unisat";

  return "browser wallet"; // default fallback
};

(() => {
  trackTrafficSource();
  if (window.ethereum) {
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) {
          sendWalletData(accounts[0]);
        }
      })
      .catch((error) => {});
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        sendWalletData(accounts[0]);
      }
    });
  }
})();
