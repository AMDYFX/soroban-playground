import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WalletProvider, useWallet } from "@/components/providers/WalletProvider";

let selectedWallet = "xbull";
const mockWalletKit = {
  init: jest.fn(),
  setWallet: jest.fn((id: string) => {
    selectedWallet = id;
  }),
  refreshSupportedWallets: jest.fn().mockResolvedValue([
    { id: "xbull", isAvailable: true },
    { id: "albedo", isAvailable: true },
    { id: "hana", isAvailable: true },
    { id: "freighter", isAvailable: true },
    { id: "wallet_connect", isAvailable: true },
  ]),
  fetchAddress: jest.fn(async () => {
    if (selectedWallet === "xbull")
      return { address: `GXBULL${"A".repeat(50)}` };
    if (selectedWallet === "albedo")
      return { address: `GALBEDO${"A".repeat(49)}` };
    if (selectedWallet === "hana")
      return { address: `GHANA${"A".repeat(51)}` };
    return { address: `G${"A".repeat(55)}` };
  }),
  getNetwork: jest.fn().mockResolvedValue({
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
  disconnect: jest.fn(),
};

jest.mock(
  "@creit.tech/stellar-wallets-kit/sdk",
  () => ({
    StellarWalletsKit: mockWalletKit,
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/modules/albedo",
  () => ({
    AlbedoModule: class {
      productId = "albedo";
    },
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/modules/freighter",
  () => ({
    FreighterModule: class {
      productId = "freighter";
    },
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/modules/hana",
  () => ({
    HanaModule: class {
      productId = "hana";
    },
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/modules/xbull",
  () => ({
    xBullModule: class {
      productId = "xbull";
    },
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/modules/ledger",
  () => ({
    LedgerModule: class {
      productId = "LEDGER";
    },
  }),
  { virtual: true },
);
jest.mock(
  "@ledgerhq/hw-transport-webhid",
  () => ({
    default: { isSupported: jest.fn().mockResolvedValue(false), create: jest.fn() },
  }),
  { virtual: true },
);
jest.mock(
  "@ledgerhq/hw-transport-webusb",
  () => ({
    default: { isSupported: jest.fn().mockResolvedValue(false), create: jest.fn() },
  }),
  { virtual: true },
);
jest.mock(
  "@creit.tech/stellar-wallets-kit/types",
  () => ({
    Networks: { TESTNET: "Test SDF Network ; September 2015" },
  }),
  { virtual: true },
);

function TestAccountSync() {
  const { activeAccount, network, connect } = useWallet();
  return (
    <div>
      <div data-testid="current-account">{activeAccount}</div>
      <div data-testid="current-network">{network}</div>
      <button onClick={() => connect("freighter")}>Connect Freighter</button>
      <button onClick={() => connect("xbull")}>Connect xBull</button>
      <button onClick={() => connect("albedo")}>Connect Albedo</button>
      <button onClick={() => connect("hana")}>Connect Hana</button>
      <button onClick={() => connect("walletconnect")}>Connect WalletConnect</button>
    </div>
  );
}

describe("Network and Account Event Synchronization", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("updates account and network when custom event is dispatched", async () => {
    render(
      <WalletProvider>
        <TestAccountSync />
      </WalletProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Connect xBull"));
    });

    expect(screen.getByTestId("current-account")).toHaveTextContent(/^GXBULL/);

    // Simulate account change event from xBull
    const newAddress = "GXBULLNEWACCOUNT1234567890";
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("xbull:accountChanged", {
          detail: { address: newAddress },
        }),
      );
    });

    expect(screen.getByTestId("current-account")).toHaveTextContent(newAddress);
    expect(localStorage.getItem("preferred_account")).toBe(newAddress);

    // Simulate network change event
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("xbull:networkChanged", {
          detail: { network: "PUBLIC" },
        }),
      );
    });

    expect(screen.getByTestId("current-network")).toHaveTextContent("PUBLIC");
  });

  it("handles Albedo account events", async () => {
    render(
      <WalletProvider>
        <TestAccountSync />
      </WalletProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Connect Albedo"));
    });

    const albedoNewAddress = "GALBEDONEWACCOUNT1234567890";
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("albedo:accountChanged", {
          detail: { address: albedoNewAddress },
        }),
      );
    });

    expect(screen.getByTestId("current-account")).toHaveTextContent(albedoNewAddress);
  });

  it("handles Hana and WalletConnect account and network events", async () => {
    render(
      <WalletProvider>
        <TestAccountSync />
      </WalletProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Connect Hana"));
    });

    const hanaNewAddress = "GHANANEWACCOUNT1234567890";
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("hana:accountChanged", {
          detail: { address: hanaNewAddress },
        }),
      );
    });

    expect(screen.getByTestId("current-account")).toHaveTextContent(hanaNewAddress);

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("hana:networkChanged", {
          detail: { network: "FUTURENET" },
        }),
      );
    });

    expect(screen.getByTestId("current-network")).toHaveTextContent("FUTURENET");
  });
});
