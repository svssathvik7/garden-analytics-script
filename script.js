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
    console.error("Error fetching IP:", error);
    return null;
  }
};

const trackTrafficSource = async () => {
  const storedReferrer = localStorage.getItem("referrer");
  const currentReferrer = document.referrer;

  if (!storedReferrer) {
    let source_type;

    if (currentReferrer == "") {
      localStorage.setItem("referrer", "Direct");
      source_type = createTrafficSource.direct();
    } else {
      localStorage.setItem("referrer", currentReferrer);
      source_type = createTrafficSource.referrer(currentReferrer);
    }
    /* javascript-obfuscator:disable */
    let payload = {
      source_type: source_type,
      url: window.location.href,
    };
    /* javascript-obfuscator:enable */

    fetch("https://garden-traffic-analysis.onrender.com/traffic/record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
        ip: await getIpAddress(),
        wallet_address: address,
        source: {
          source_type: source,
          url: window.location.href,
        },
        wallet_type: getWalletType(),
      };
      /* javascript-obfuscator:enable */

      console.log("wallet req!", payload);
      fetch("https://garden-traffic-analysis.onrender.com/wallet/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
