import { Address } from "@graphprotocol/graph-ts";
export function getWildTokenForNetwork(): Address {
  return Address.fromString("0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79");
}

export function getWildDomainNetworkIdForNetwork(): string {
  return "0x196c0a1e30004b9998c97b363e44f1f4e97497e59d52ad151208e9393d70bb3b";
}
