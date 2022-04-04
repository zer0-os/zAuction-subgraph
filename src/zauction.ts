import {
  Account,
  TokenSale,
  DomainTokenSold,
  BuyPriceSet,
  Cancellation,
} from "../generated/schema";
import {
  BidAccepted,
  DomainSold,
  BuyNowPriceSet,
  BidCancelled,
} from "../generated/ZAuction/ZAuction";
import { toPaddedHexString, uint256ToByteArray } from "./utils";
import { ethereum } from "@graphprotocol/graph-ts";

function resolveAccount(address: string): Account {
  let account = Account.load(address);
  if (!account) {
    account = new Account(address);
  }
  return account as Account;
}

function id(event: ethereum.Event): string {
  const id = event.block.number.toString().concat("-").concat(event.logIndex.toString());
  return id;
}

export function handleBidAccepted(event: BidAccepted): void {
  const bidder = resolveAccount(event.params.bidder.toHex());
  bidder.save();
  const seller = resolveAccount(event.params.seller.toHex());
  seller.save();

  const saleId =
    event.params.nftAddress.toHexString() +
    "-" +
    event.params.tokenId.toString() +
    "-" +
    event.block.timestamp.toString();

  const sale = new TokenSale(saleId);
  sale.tokenId = toPaddedHexString(event.params.tokenId);
  sale.contractAddress = event.params.nftAddress.toHex();
  sale.amount = event.params.amount;
  sale.buyer = bidder.id;
  sale.seller = seller.id;
  sale.timestamp = event.block.timestamp;
  sale.save();
}

export function handleDomainSold(event: DomainSold): void {
  const domainSold = new DomainTokenSold(id(event));

  const buyer = resolveAccount(event.params.buyer.toHex());
  buyer.save();
  const seller = resolveAccount(event.params.seller.toHex());
  seller.save();

  domainSold.buyer = buyer.id;
  domainSold.seller = seller.id;
  domainSold.amount = event.params.amount;
  domainSold.tokenId = toPaddedHexString(event.params.tokenId);
  domainSold.contractAddress = event.params.nftAddress.toHex();
  domainSold.timestamp = event.block.timestamp;
  domainSold.save();
}

export function handleBuyNowPriceSet(event: BuyNowPriceSet): void {
  const priceSet = new BuyPriceSet(id(event));

  priceSet.tokenId = toPaddedHexString(event.params.tokenId);
  priceSet.amount = event.params.amount;
  priceSet.save();
}

export function handleBidCancelled(event: BidCancelled): void {
  const cancellation = new Cancellation(id(event));

  const bidder = resolveAccount(event.params.bidder.toHex());
  cancellation.bidNonce = event.params.bidNonce;
  cancellation.bidder = bidder.id;
  cancellation.save();
}
