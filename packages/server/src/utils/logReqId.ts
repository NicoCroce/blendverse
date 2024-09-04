export const logReqId = (
  file: string,
  param: { requestId: string; userId: string; input: string },
) => {
  console.log('---------');
  console.log(`=> FILE: ${file}`);
  console.log('RQ ID', param.requestId);
  console.log('User ID', param.userId);
  console.log('Input ', param.input);
  console.log('---------');
};
