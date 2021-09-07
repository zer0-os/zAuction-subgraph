import { Account, TokenSale } from "../generated/schema";
import { BidAccepted } from "../generated/ZAuction/ZAuction";
import { uint256ToByteArray } from "./utils";

export function handleBidAccepted(event: BidAccepted): void {
  let bidder = new Account(event.params.bidder.toHex());
  bidder.save();
  let seller = new Account(event.params.seller.toHex());
  seller.save();

  let saleId =
    event.params.nftaddress.toHexString() +
    "-" +
    event.params.tokenid.toString() +
    "-" +
    event.block.timestamp.toString();

  let sale = new TokenSale(saleId);
  sale.tokenId = uint256ToByteArray(event.params.tokenid).toHex();
  sale.contractAddress = event.params.nftaddress;
  sale.amount = event.params.amount;
  sale.buyer = bidder.id;
  sale.seller = seller.id;
  sale.timestamp = event.block.timestamp;
  sale.save();
}
