const TrafficSourceType = {
  Referrer: "Referrer",
  Direct: "Direct",
};

// AES encryption key (32 bytes for AES-256)
const ENCRYPTION_KEY = "your-secure-32-byte-encryption-key-here";

// Key derivation function to ensure 256-bit key length
const deriveKey = async (key) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("analytics-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
};

// Encryption utilities
const encryptPayload = async (data) => {
  try {
    // Derive a proper 256-bit key
    const key = await deriveKey(ENCRYPTION_KEY);

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Import the key
    return crypto.subtle
      .importKey("raw", keyBytes, { name: "AES-GCM", length: 256 }, false, [
        "encrypt",
      ])
      .then((key) => {
        // Convert data to string if it's an object
        const dataStr =
          typeof data === "object" ? JSON.stringify(data) : String(data);

        // Encrypt the data
        return crypto.subtle
          .encrypt(
            { name: "AES-GCM", iv },
            key,
            new TextEncoder().encode(dataStr)
          )
          .then((encrypted) => {
            // Combine IV and encrypted data
            const encryptedArray = new Uint8Array(encrypted);
            const combined = new Uint8Array(iv.length + encryptedArray.length);
            combined.set(iv);
            combined.set(encryptedArray, iv.length);

            // Convert to base64
            return btoa(String.fromCharCode.apply(null, combined));
          });
      });
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
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

const trackTrafficSource = async () => {
  const storedReferrer = localStorage.getItem("referrer");
  const currentReferrer = document.referrer;

  if (!storedReferrer) {
    let source;

    if (currentReferrer == "") {
      localStorage.setItem("referrer", "Direct");
      source = createTrafficSource.direct();
    } else {
      localStorage.setItem("referrer", currentReferrer);
      source = createTrafficSource.referrer(currentReferrer);
    }
    let payload = {
      source_type: source,
      url: window.location.href,
    };

    // Encrypt the payload
    encryptPayload(payload).then((encryptedData) => {
      if (!encryptedData) return;

      fetch("http://localhost:3001/traffic/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: encryptedData }),
      })
        .then((response) => {
          return response;
        })
        .catch((error) => {});
    });
  }
};

const getWalletType = () => {
  if (!window.ethereum) return null;

  // Check for specific wallet providers
  if (window.ethereum.isMetaMask) return "metamask";
  if (window.ethereum.isBraveWallet) return "brave wallet";
  if (window.ethereum.isPhantom) return "phantom";
  if (window.ethereum.isCoinbaseWallet) return "coinbase wallet";
  if (window.ethereum.isOKXWallet) return "okx wallet";
  if (window.ethereum.isRabby) return "rabby wallet";
  if (window.unisat) return "unisat";

  return "browser wallet"; // default fallback
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
      const referrer = localStorage.getItem("referrer") || "Direct";
      const payload = {
        ip: await getIpAddress(),
        wallet_address: address,
        source: {
          source_type: referrer,
          url: window.location.href,
        },
        wallet_type: getWalletType(),
      };

      // Encrypt wallet data payload
      encryptPayload(payload).then((encryptedData) => {
        if (!encryptedData) return;

        fetch("http://localhost:3001/wallet/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: encryptedData }),
        });
      });
    } else {
    }
  } catch (error) {}
};

(() => {
  getIpAddress();
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
