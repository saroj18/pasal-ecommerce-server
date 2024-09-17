export const khaltiPaymentVerify = async (pidx: string) => {
  const resp = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
    method: "POST",
    body: JSON.stringify({
      pidx,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Key 0c05e393ff924ec2827d3fbe33f013ad",
    },
  });
  const data = await resp.json();
  return data;
};
