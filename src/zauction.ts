import { Account, TokenSale, DomainTokenSold, BuyPriceSet, Cancellation } from "../generated/schema";
import { BidAccepted, DomainSold, BuyNowPriceSet, BidCancelled } from "../generated/ZAuction/ZAuction";
import { uint256ToByteArray } from "./utils";
import { ethereum } from "@graphprotocol/graph-ts";

function resolveAccount(address: string) {
  let account = Account.load(address);
  if (!account) {
    account = new Account(address);
  }
  return account;
}

function id(event: ethereum.Event) {
  const id = (event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString()));
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
  sale.tokenId = uint256ToByteArray(event.params.tokenId).toHex();
  sale.contractAddress = event.params.nftAddress;
  sale.amount = event.params.amount;
  sale.buyer = bidder.id;
  sale.seller = seller.id;
  sale.timestamp = event.block.timestamp;
  sale.save();
}

export function handleDomainSold(event: DomainSold) {
  const domainSold = new DomainTokenSold(id(event));

  const buyer = resolveAccount(event.params.buyer.toHex());
  buyer.save();
  const seller = resolveAccount(event.params.seller.toHex());
  seller.save();

  domainSold.buyer = buyer.id;
  domainSold.seller = seller.id;
  domainSold.amount = event.params.amount;
  domainSold.tokenId = event.params.tokenId;
  domainSold.save();
}

export function handleBuyNowPriceSet(event: BuyNowPriceSet) {
  const priceSet = new BuyPriceSet(id(event));

  priceSet.tokenId = event.params.tokenId;
  priceSet.amount = event.params.amount;
  priceSet.save();
}

export function handleBidCancelled(event: BidCancelled) {
  const cancellation = new Cancellation(id(event));

  const bidder = resolveAccount(event.params.bidder.toHex());
  cancellation.bidNonce = event.params.bidNonce;
  cancellation.bidder = bidder.id;
  cancellation.save();
}
