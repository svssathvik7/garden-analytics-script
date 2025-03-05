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
    // dont await it slows the service
    fetch(`${process.env.BACKEND_TRAFFIC_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
        wallet_address: address,
        source: {
          source_type: referrer,
          url: window.location.href,
        },
        wallet_type: getWalletType(),
      };

      fetch(`${process.env.BACKEND_WALLET_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    } else {
    }
  } catch (error) {}
};

(() => {
  console.log("script loaded");
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
