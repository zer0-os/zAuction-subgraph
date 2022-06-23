import {
  Account,
  TokenSale,
  DomainTokenSold,
  BuyNowListing,
  Cancellation,
  Global,
} from "../generated/schema";
import {
  BidAccepted,
  DomainSold,
  BuyNowPriceSet,
  BidCancelled,
} from "../generated/ZAuction/ZAuction";
import { toPaddedHexString } from "./utils";
import { ethereum } from "@graphprotocol/graph-ts";
import {
  BidAcceptedV2,
  BuyNowPriceSetV2,
  DomainSoldV2,
} from "../generated/LegacyZAuction/ZAuction";
import { getWildTokenForNetwork, getWildDomainNetworkIdForNetwork } from "./wildInfo";

function getIndexId(): i32 {
  let global = Global.load("1");
  if (!global) {
    global = new Global("1");
    global.uniqueEntityId = 0;
  }
  global.uniqueEntityId += 1;
  global.save();
  return global.uniqueEntityId;
}

function resolveAccount(address: string): Account {
  let account = Account.load(address);
  if (!account) {
    account = new Account(address);
  }
  return account as Account;
}

function resolveListing(tokenId: string): BuyNowListing {
  let listing = BuyNowListing.load(tokenId);
  if (!listing) {
    listing = new BuyNowListing(tokenId);
    listing.indexId = getIndexId();
  }
  return listing as BuyNowListing;
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

  // still check .bind with zauction here when local
  const sale = new TokenSale(saleId);
  sale.bidNonce = event.params.bidNonce;
  sale.tokenId = toPaddedHexString(event.params.tokenId);
  sale.contractAddress = event.params.nftAddress.toHex();
  sale.amount = event.params.amount;
  sale.buyer = bidder.id;
  sale.seller = seller.id;  
  sale.timestamp = event.block.timestamp;
  sale.paymentToken = getWildTokenForNetwork().toHex();
  sale.topLevelDomainId = getWildDomainNetworkIdForNetwork();
  sale.indexId = getIndexId();

  sale.save();
}

export function handleBidAcceptedV2(event: BidAcceptedV2): void {
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
  sale.bidNonce = event.params.bidNonce;
  sale.tokenId = toPaddedHexString(event.params.tokenId);
  sale.contractAddress = event.params.nftAddress.toHex();
  sale.amount = event.params.amount;
  sale.buyer = bidder.id;
  sale.seller = seller.id;
  sale.timestamp = event.block.timestamp;
  sale.paymentToken = event.params.paymentToken.toHex();
  sale.topLevelDomainId = event.params.topLevelDomainId.toHex();
  sale.indexId = getIndexId();

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
  domainSold.paymentToken = getWildTokenForNetwork().toHex();
  domainSold.topLevelDomainId = getWildDomainNetworkIdForNetwork();
  domainSold.indexId = getIndexId()

  domainSold.save();
}

export function handleDomainSoldV2(event: DomainSoldV2): void {
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
  domainSold.paymentToken = event.params.paymentToken.toHex();
  domainSold.topLevelDomainId = event.params.topLevelDomainId.toHex();
  domainSold.indexId = getIndexId();

  domainSold.save();
}

export function handleBuyNowPriceSet(event: BuyNowPriceSet): void {
  const listing = resolveListing(toPaddedHexString(event.params.tokenId));

  listing.amount = event.params.amount;
  listing.paymentToken = getWildTokenForNetwork().toHex();
  listing.save();
}

export function handleBuyNowPriceSetV2(event: BuyNowPriceSetV2): void {
  const listing = resolveListing(toPaddedHexString(event.params.tokenId));

  listing.amount = event.params.amount;
  listing.paymentToken = event.params.paymentToken.toHex();
  listing.save();
}

export function handleBidCancelled(event: BidCancelled): void {
  const cancellation = new Cancellation(id(event));

  const bidder = resolveAccount(event.params.bidder.toHex());
  cancellation.bidNonce = event.params.bidNonce;
  cancellation.bidder = bidder.id;
  cancellation.indexId = getIndexId();
  cancellation.save();
}
