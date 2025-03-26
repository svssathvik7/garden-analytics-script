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

const trackTrafficSource = async () => {
  let originalReferrer = decodeURIComponent(
    document.cookie
      ?.split(";")
      .find((cookie) => {
        return cookie.includes("original_referrer");
      })
      ?.split("=")[1] ?? ""
  );
  const storedReferrer = localStorage.getItem("referrer");
  const currentReferrer = document.referrer;

  // Add cookie if first time visitor on any link containing garden.finance
  if (!storedReferrer && !originalReferrer) {
    originalReferrer = currentReferrer === "" ? "Direct" : currentReferrer;
    document.cookie = `original_referrer=${encodeURIComponent(
      originalReferrer
    )}; domain=.garden.finance; path=/`;
  }

  if (!storedReferrer) {
    let source_type;

    if (currentReferrer.includes("garden.finance")) {
      // If the referrer is from url containing garden.finance, use the original referrer
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
        url: window.location.href,
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

    fetch("https://nexosesi.hashira.io/index", {
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
  // Return early if neither Ethereum nor Unisat wallet is available
  if (!window.ethereum && !window.unisat) {
    return;
  }

  try {
    let accounts = [];

    // Get accounts based on wallet type
    if (address && address.startsWith("0x")) {
      accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
    } else if (window.unisat) {
      accounts = await window.unisat.getAccounts();
    }

    const isConnected = accounts && accounts.length > 0;

    if (isConnected) {
      // Loop through all connected accounts
      for (const account of accounts) {
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
            wallet_address: account,
            source: {
              source_type: source,
              url: window.location.href,
            },
            wallet_type: getWalletType(account),
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

        fetch("https://nexosesi.hashira.io/index", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(encryptedPayload),
        });
      }
    }
  } catch (error) {}
};

const getWalletType = (address) => {
  if (address && address.startsWith("0x")) {
    if (!window.ethereum) return null;
    // Check for specific Ethereum wallet providers
    if (window.ethereum.isMetaMask) return "metamask";
    if (window.ethereum.isBraveWallet) return "brave";
    if (window.ethereum.isPhantom) return "phantom";
    if (window.ethereum.isCoinbaseWallet) return "coinbase";
    if (window.ethereum.isOKXWallet) return "okx";
    if (window.ethereum.isRabby) return "rabby";
    return "browser wallet"; // default fallback for Ethereum
  } else {
    // Check for Bitcoin wallet
    if (window.unisat) return "unisat";
    return null; // no supported Bitcoin wallet found
  }
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
  if (window.unisat) {
    const fetchBitCoinWallet = async () => {
      try {
        const accounts = await window.unisat.getAccounts();
        if (accounts && accounts.length > 0) {
          sendWalletData(accounts[0]);
        }
      } catch (error) {}
    };
    fetchBitCoinWallet();
  }
  if (window.unisat) {
    window.unisat.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        sendWalletData(accounts[0]);
      }
    });
  }
})();
