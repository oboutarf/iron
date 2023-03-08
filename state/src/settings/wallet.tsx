import * as Constants from "@iron/constants";
import * as z from "zod";
import { deriveAddress } from "../addresses";
import { ethers } from "ethers";
import { SettingsFullSchema } from "./index";
import { type Stream } from "stream";

const schema = z.object({
  mnemonic: z
    .string()
    .regex(/^(\w+\s){11}\w+$/, { message: "Must be a 12-word phrase" }),
  derivationPath: z
    .string()
    .regex(/^m\/(\d+'?\/)+\d+$/, { message: "invalid path format" }),
  addressIndex: z.number().int().min(0).max(3),
});

export type WalletSchema = z.infer<typeof schema>;

interface ExtraFields {
  address: string;
}

export type WalletFullSchema = WalletSchema & ExtraFields;

type Opts = {
  get: () => SettingsFullSchema;
  stream: Stream;
};

export const WalletSettings = {
  schema,

  defaults() {
    return {
      mnemonic: Constants.wallet.mnemonic,
      derivationPath: Constants.wallet.path,
      addressIndex: Constants.wallet.index,
      address: deriveAddress(
        Constants.wallet.mnemonic,
        Constants.wallet.path,
        Constants.wallet.index
      ),
    };
  },

  setWalletSettings(
    wallet: WalletSchema,
    { get, stream }: Opts
  ): WalletFullSchema {
    const oldSettings = get();
    const { mnemonic, derivationPath, addressIndex } = wallet;
    const walletNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const childNode = walletNode.derivePath(
      `${derivationPath}/${addressIndex}`
    );
    const address = childNode.address;

    const addressChanged = address != oldSettings.wallet.address;

    if (addressChanged) {
      stream.write({
        type: "broadcast",
        payload: {
          method: "accountsChanged",
          params: [address],
        },
      });
    }

    return {
      ...wallet,
      address,
    };
  },
};