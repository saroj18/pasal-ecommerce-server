import fetch from "node-fetch";

type StatusType = {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: string;
  ref_id: string;
};

export const esewaStatusInfo = async (token: { [key: string]: string }) => {
  console.log("uuid", token.transaction_uuid);
  console.log("amount", token.total_amount);
  const resp = await fetch(
    `https://uat.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${token.total_amount}&transaction_uuid=${token.transaction_uuid}`
  );
  const respData = (await resp.json()) as StatusType;

  return respData;
};
